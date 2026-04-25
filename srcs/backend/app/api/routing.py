from django.urls import re_path
from . import consumers

# defines the WebSocket URL pattern ('ws/chat/<conversation_id>/') for the chat application
websocket_urlpatterns = [
    re_path(r"ws/chat/(?P<conversation_id>\d+)/$", consumers.ChatConsumer.as_asgi()),
]