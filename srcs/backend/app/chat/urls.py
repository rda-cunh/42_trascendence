from django.urls import path
from .views import ConversationListView, ConversationDetailView, MessageListView, StartConversationView

urlpatterns = [
    path("conversations/", ConversationListView.as_view(), name="conversation-list"),
    path("conversations/start/", StartConversationView.as_view(), name="start-conversation"),
    path("conversations/<int:conversation_id>/", ConversationDetailView.as_view(), name="conversation-detail"),
    path("conversations/<int:conversation_id>/messages/", MessageListView.as_view(), name="message-list"),
]