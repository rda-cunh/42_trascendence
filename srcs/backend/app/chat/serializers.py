from rest_framework import serializers
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    buyer_name = serializers.CharField(source='buyer.username', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    listing_name = serializers.CharField(source='listing.name', read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "listing", "buyer", "seller", "created_at", "last_message", "last_message_at", "buyer_name", "seller_name", "listing_name"]


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "content", "created_at", "read_at", "sender_name"]