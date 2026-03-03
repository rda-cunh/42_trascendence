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


@api_view(["GET"])
def listing_full(request):

    data = [
            {
                "product_id": 1,
                "title": "Infinity shader",
                "price": 19.99,
                "currency": "EUR",
                "status": "active",
                },
            {
                "product_id": 2,
                "title": "Erik shader",
                "price": 19.99,
                "currency": "EUR",
                "status": "active",
                },
            {
                "product_id": 3,
                "title": "Rainbow shader",
                "price": 19.99,
                "currency": "EUR",
                "status": "active",
                },
            {
                "product_id": 4,
                "title": "Punk shader",
                "price": 19.99,
                "currency": "EUR",
                "status": "active",
                },
            ]
    return Response({"count": len(data), "results": data})


@api_view(["POST"])
def add_listing(request):

    return Response(request)

# Create your views here.
