import json
import os
from urllib.parse import parse_qs

import httpx                        # httpx is an alternative to requests that supports async
from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

# httpx ignores REQUESTS_CA_BUNDLE, so resolve the internal CA bundle ourselves and pass it via verify=
_CA_BUNDLE = os.environ.get("REQUESTS_CA_BUNDLE") or os.environ.get("SSL_CERT_FILE")
_HTTPX_VERIFY = _CA_BUNDLE if _CA_BUNDLE else True

async def proxy_chat_request_async(method, endpoint, data=None, params=None):
    """ helper function to proxy requests from the ChatConsumer to the data-service for chat """

    base_url = settings.DATA_SERVICE_URL.rstrip("/")
    url = f"{base_url}/{endpoint.lstrip('/')}"
    headers = {"X-Internal-Token": settings.DATA_SERVICE_TOKEN}

    async with httpx.AsyncClient(timeout=5.0, verify=_HTTPX_VERIFY) as client:
        response = await client.request(method, url, json=data, params=params, headers=headers)

    if response.status_code == 204 or not response.content:
        return response.status_code, {}
    try:
        return response.status_code, response.json()
    except ValueError:
        return response.status_code, {"detail": response.text}

class ChatConsumer(AsyncWebsocketConsumer):
    """ MVP real-time chat consumer """

    async def connect(self):
        """ accept the webSocket connection """
        # route param captured in api/routing.py
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"chat_{self.conversation_id}"

        # extract the token from the query string
        token = self._extract_token_from_query_string()
        if not token:
            await self.close(code=4001)
            return

        # get user id
        user_id = self._validate_jwt_and_get_user_id(token)
        if not user_id:
            await self.close(code=4001)
            return

        self.user_id = user_id

        # check if user is allowed to access the conversation
        is_allowed = await self._user_can_access_conversation(
            conversation_id=self.conversation_id,
            user_id=self.user_id,
        )
        if not is_allowed:
            await self.close(code=4003)
            return

        # adds user to the conversation group/room (websocket subscription)
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        """ handle disconnection (cleanup if needed) when receiving the close_code (1000, 4001 or 4003) """
        if hasattr(self, "group_name"):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        """ echo the received message back to the client """
        # tests of text_data exists and its valid
        if not text_data:
            return

        try:
            payload = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "type": "error",
                "detail": "Invalid JSON payload",
            }))
            return

        message_text = (payload.get("message") or "").strip()
        if not message_text:
            await self.send(text_data=json.dumps({
                "type": "error",
                "detail": "Message cannot be empty",
            }))
            return

        # save message into data-service and validate the return code
        status_code, saved_message = await proxy_chat_request_async(
            method="POST",
            endpoint=f"/chat/conversations/{self.conversation_id}/messages/",
            data={
                "sender_id": self.user_id,
                "content": message_text,
            },
        )

        if status_code != 201:
            await self.send(text_data=json.dumps({
                "type": "error",
                "detail": "Could not save message",
                "upstream_status": status_code,
                "upstream_response": saved_message,
            }))
            return

        # data-service ConversationMessages model omits conversation_id but frontend needs it to update the conversation list preview, so we attach it here
        saved_message["conversation_id"] = int(self.conversation_id)

        # distribute the message to the group
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "chat.message",         # this maps into chat_message method (websocket pattern)
                "message": saved_message,
            },
        )

    async def chat_message(self, event):
        # takes a message that was broadcast to the group and sends it through the websocket to the connected client
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
        }))

    def _extract_token_from_query_string(self):
        """ channels showd the query string in scope['query_string'] as bytes and is decoded and parsed like a normal URL query string """
        raw_query_string = self.scope.get("query_string", b"").decode("utf-8")
        parsed = parse_qs(raw_query_string)
        token_list = parsed.get("token", [])
        return token_list[0] if token_list else None

    def _validate_jwt_and_get_user_id(self, token):
        """ validate JWT and return Django-shadow user id """
        try:
            access_token = AccessToken(token)   # accessToken decodes token, validates signature and expiration, and makes the payload available
            return int(access_token["user_id"])
        except (TokenError, KeyError, ValueError):
            return None

    async def _user_can_access_conversation(self, conversation_id, user_id):
        """ asking the data-service if user belongs to conversation - only buyer or seller """
        status_code, conversation = await proxy_chat_request_async("GET", f"/chat/conversations/by-id/{conversation_id}/")
        if status_code != 200:
            return False
        return user_id in {conversation.get("buyer_id"), conversation.get("seller_id")}