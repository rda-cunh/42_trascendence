import json
from unittest import IsolatedAsyncioTestCase
from unittest.mock import AsyncMock, patch

from django.test import TestCase
from rest_framework_simplejwt.tokens import AccessToken

from .consumers import ChatConsumer

class ChatConsumerHelpersTests(TestCase):
    def test_extract_token_from_query_string(self):
        consumer = ChatConsumer()
        consumer.scope = {"query_string": b"token=abc123"}
        self.assertEqual(consumer._extract_token_from_query_string(), "abc123")

    def test_validate_jwt_and_get_user_id(self):
        token = AccessToken()
        token["user_id"] = 42

        consumer = ChatConsumer()
        self.assertEqual(consumer._validate_jwt_and_get_user_id(str(token)), 42)

    @patch("api.consumers.proxy_chat_request", return_value=(200, {"buyer_id": 7, "seller_id": 42}))
    def test_user_can_access_conversation(self, proxy_mock):
        consumer = ChatConsumer()
        self.assertTrue(consumer._user_can_access_conversation(conversation_id=10, user_id=42))
        proxy_mock.assert_called_once_with(
            method="GET",
            endpoint="/chat/conversations/by-id/10/",
        )


class ChatConsumerReceiveTests(IsolatedAsyncioTestCase):
    async def test_receive_rejects_invalid_json(self):
        consumer = ChatConsumer()
        consumer.send = AsyncMock()

        await consumer.receive(text_data="{invalid")

        consumer.send.assert_awaited_once()
        payload = json.loads(consumer.send.await_args.kwargs["text_data"])
        self.assertEqual(payload["type"], "error")
        self.assertEqual(payload["detail"], "Invalid JSON payload")

    @patch("api.consumers.proxy_chat_request", return_value=(201, {"id": 1, "content": "hello"}))
    async def test_receive_broadcasts_saved_message(self, proxy_mock):
        consumer = ChatConsumer()
        consumer.user_id = 42
        consumer.conversation_id = 10
        consumer.group_name = "chat_10"
        consumer.channel_layer = AsyncMock()

        await consumer.receive(text_data=json.dumps({"message": " hello "}))

        proxy_mock.assert_called_once_with(
            method="POST",
            endpoint="/chat/conversations/10/messages/",
            data={"sender_id": 42, "content": "hello"},
        )
        consumer.channel_layer.group_send.assert_awaited_once_with(
            "chat_10",
            {"type": "chat.message", "message": {"id": 1, "content": "hello"}},
        )
