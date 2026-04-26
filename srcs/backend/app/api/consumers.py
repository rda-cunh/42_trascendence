import json
from urllib.parse import parse_qs

import requests
from django.conf import settings
from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError

def proxy_chat_request(method, endpoint, data=None, params=None):
    """Helper function to proxy HTTP requests to data-service with JWT authentication"""

    # builds the url, ensuring the endpoint starts with a slash
    base_url = settings.DATA_SERVICE_URL.rstrip("/")
    endpoint_path = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    url = f"{base_url}{endpoint_path}"

    # Include the internal token for authentication with data-service
    headers = {
        "X-Internal-Token": settings.DATA_SERVICE_TOKEN,
    }

    # send the request to data-service
    response = requests.request(
        method=method,
        url=url,
        json=data,
        params=params,
        headers=headers,
        timeout=5,
    )

    # handle empty responses (204 No Content) or non-JSON
    if response.status_code == 204 or not response.content:
        return response.status_code, {}

    # try to parse JSON response
    try:
        return response.status_code, response.json()
    except ValueError:
        return response.status_code, {"detail": response.text}

class ChatConsumer(AsyncWebsocketConsumer):
    """ MVP real-time chat consumer"""

    async def connect(self):
        # accept the webSocket connection
        # route param captured in api/routing.py
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.group_name = f"chat_{self.conversation_id}"

        token = self._extract_token_from_query_string()
        if not token:
            await self.close(code=4001)
            return

        user_id = self._validate_jwt_and_get_user_id(token)
        if not user_id:
            await self.close(code=4001)
            return

        self.user_id = user_id

        is_allowed = self._user_can_access_conversation(
            conversation_id=self.conversation_id,
            user_id=self.user_id,
        )
        if not is_allowed:
            await self.close(code=4003)
            return

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # handle disconnection (cleanup if needed)
        pass

    async def receive(self, text_data):
        # echo the received message back to the client (for testing)
        await self.send(text_data=json.dumps({
            'message': text_data
        }))