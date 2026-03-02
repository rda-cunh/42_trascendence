from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def listing_detail(request, id):
    data = {
            "requested_id": id,
            "listing": {
                "product_id": 1,
                "title": "Infinity shader",
                "price": 19.99,
                "currency": "EUR",
                "status": "active",
                },
            }
    return Response(data)

# Create your views here.
