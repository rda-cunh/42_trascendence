from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import models
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


# Chat API Views

class ConversationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        conversations = Conversation.objects.filter(
            models.Q(buyer=user) | models.Q(seller=user)
        ).order_by('-last_message_at')
        serializer = ConversationSerializer(conversations, many=True)
        return Response(serializer.data)


class ConversationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user not in [conversation.buyer, conversation.seller]:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data)


class MessageListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        conversation = get_object_or_404(Conversation, id=conversation_id)
        if request.user not in [conversation.buyer, conversation.seller]:
            return Response({"error": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)
        messages = Message.objects.filter(conversation=conversation).order_by('created_at')
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)


class StartConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        listing_id = request.data.get('listing_id')
        from api.models import Product
        listing = get_object_or_404(Product, id=listing_id)
        buyer = request.user
        seller = listing.seller
        seller = listing.seller

        if buyer == seller:
            return Response({"error": "Cannot start conversation with yourself"}, status=status.HTTP_400_BAD_REQUEST)

        conversation, created = Conversation.objects.get_or_create(
            listing=listing,
            buyer=buyer,
            seller=seller,
            defaults={'last_message': '', 'last_message_at': None}
        )
        serializer = ConversationSerializer(conversation)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
