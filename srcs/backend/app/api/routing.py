from django.urls import re_path
from . import consumers

# WebSocket URL patterns. Each URL maps to a consumer class.
# Auth happens inside each consumer's connect() — see api/consumers.py.
websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<conversation_id>\d+)/$", consumers.ChatConsumer.as_asgi()),
    re_path(r"ws/notifications/$",                 consumers.NotificationConsumer.as_asgi()),
]