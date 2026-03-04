from rest_framework.decorators import APIView
from rest_framework.response import Response
# from .models import Product
# from .serializers import ProductSerializer


# Auth API


class user_create(APIView):
    def post(self, request):
        # This api should have [user] [email] [passhash]
        data = {
                "Message": "User created Sucessfully", "user_id": 101,
                }
        return (data)

    def delete(self, request):
        # This api should have JWT_String, passhash, user id
        data = {
                "Message": "User account has been terminated",
                }
        return (data)


class user_session(APIView):
    def post(self, request):
        # this api should have email and passhash
        data = {
            "token": "JWT_STRING", "status": "Login Successful",
                }
        return (data)

    def delete(self, request):
        # this api should have JWT_STRING
        return ({"Message": "Logged out"})


class user_profile(APIView):
    def get(self, request):
        # api should have JWT_STRING if does not match, different information is provided
        data = {
                "user_info": {
                    "username": "Rapcampo",
                    "email": "example@42.com",
                    "billing address": "Avenida dos aliados, 42, 4000-000",
                    "avatar": "url",
                    "user_id": 1,
                    "Products_owned": [1, 2, 5, 6],
                    "Current_order": 1,  # unique order ids may be interesting here
                    "Order_history": [2, 4, 5],
                    },
                }
        return (data)

    def patch(self, request):
        # api should probably receive all user info that needs to be edited
        return ({"Status": "User profile has been updated successfully"})

    def delete(self, request):
        # api should probably receive all user info that needs to be deleted
        return ({"Status": "User profile has been updated successfully"})

# Product listings API


class listing_id(APIView):
    def get(self, request, id):

        data = {
                "requested_id": id,
                "listing": {
                    "product_id": 1,
                    "name": "Infinity shader",
                    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla mauris sed nibh scelerisque, ultrices ornare velit aliquam. Cras semper neque nec metus suscipit scelerisque. Nulla in lorem facilisis, efficitur libero nec, pellentesque eros. Aliquam at tortor odio. Nam pretium lobortis leo, vitae sodales eros sagittis fringilla. Sed ligula mauris, congue in finibus non, vulputate a neque. Nunc eleifend ex urna, id laoreet sapien aliquam eget. Donec lorem neque, efficitur et viverra eget, auctor sit amet nisl. Nulla sodales, nisl sit amet pharetra posuere, mi lorem cursus erat, sed ultricies quam urna a magna. Praesent tincidunt ligula in arcu condimentum lobortis. Nunc rhoncus lobortis nibh sit amet venenatis. Fusce eget cursus tellus. Proin molestie dolor eget nisl faucibus iaculis vel imperdiet tellus. Integer vel ligula sit amet lacus ornare facilisis vel et ipsum. Ut laoreet ipsum purus, sit amet posuere sapien eleifend et. In non felis a libero tempor vestibulum.",
                    "price": 19.99,
                    "currency": "EUR",
                    "status": "active",
                    },
                }
        return Response(data)

    def patch(self, request, id):
        return Response({"status": f"Product {id} updated sucessfully"})

    def delete(self, request, id):
        return Response({"status": f"Product {id} deleted sucessfully"})


class listing_full(APIView):
    def post(self, request):
        return Response({"product_id": 1})

    def get(self, request):

        data = [
                {
                    "product_id": 1,
                    "name": "Infinity shader",
                    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla mauris sed nibh scelerisque, ultrices ornare velit aliquam. Cras semper neque nec metus suscipit scelerisque. Nulla in lorem facilisis, efficitur libero nec, pellentesque eros. Aliquam at tortor odio. Nam pretium lobortis leo, vitae sodales eros sagittis fringilla. Sed ligula mauris, congue in finibus non, vulputate a neque. Nunc eleifend ex urna, id laoreet sapien aliquam eget. Donec lorem neque, efficitur et viverra eget, auctor sit amet nisl. Nulla sodales, nisl sit amet pharetra posuere, mi lorem cursus erat, sed ultricies quam urna a magna. Praesent tincidunt ligula in arcu condimentum lobortis. Nunc rhoncus lobortis nibh sit amet venenatis. Fusce eget cursus tellus. Proin molestie dolor eget nisl faucibus iaculis vel imperdiet tellus. Integer vel ligula sit amet lacus ornare facilisis vel et ipsum. Ut laoreet ipsum purus, sit amet posuere sapien eleifend et. In non felis a libero tempor vestibulum.",
                    "price": 19.99,
                    "currency": "EUR",
                    "status": "active",
                    },
                {
                    "product_id": 2,
                    "name": "Erik shader",
                    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla mauris sed nibh scelerisque, ultrices ornare velit aliquam. Cras semper neque nec metus suscipit scelerisque. Nulla in lorem facilisis, efficitur libero nec, pellentesque eros. Aliquam at tortor odio. Nam pretium lobortis leo, vitae sodales eros sagittis fringilla. Sed ligula mauris, congue in finibus non, vulputate a neque. Nunc eleifend ex urna, id laoreet sapien aliquam eget. Donec lorem neque, efficitur et viverra eget, auctor sit amet nisl. Nulla sodales, nisl sit amet pharetra posuere, mi lorem cursus erat, sed ultricies quam urna a magna. Praesent tincidunt ligula in arcu condimentum lobortis. Nunc rhoncus lobortis nibh sit amet venenatis. Fusce eget cursus tellus. Proin molestie dolor eget nisl faucibus iaculis vel imperdiet tellus. Integer vel ligula sit amet lacus ornare facilisis vel et ipsum. Ut laoreet ipsum purus, sit amet posuere sapien eleifend et. In non felis a libero tempor vestibulum.",
                    "price": 19.99,
                    "currency": "EUR",
                    "status": "active",
                    },
                {
                    "product_id": 3,
                    "name": "Rainbow shader",
                    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla mauris sed nibh scelerisque, ultrices ornare velit aliquam. Cras semper neque nec metus suscipit scelerisque. Nulla in lorem facilisis, efficitur libero nec, pellentesque eros. Aliquam at tortor odio. Nam pretium lobortis leo, vitae sodales eros sagittis fringilla. Sed ligula mauris, congue in finibus non, vulputate a neque. Nunc eleifend ex urna, id laoreet sapien aliquam eget. Donec lorem neque, efficitur et viverra eget, auctor sit amet nisl. Nulla sodales, nisl sit amet pharetra posuere, mi lorem cursus erat, sed ultricies quam urna a magna. Praesent tincidunt ligula in arcu condimentum lobortis. Nunc rhoncus lobortis nibh sit amet venenatis. Fusce eget cursus tellus. Proin molestie dolor eget nisl faucibus iaculis vel imperdiet tellus. Integer vel ligula sit amet lacus ornare facilisis vel et ipsum. Ut laoreet ipsum purus, sit amet posuere sapien eleifend et. In non felis a libero tempor vestibulum.",
                    "price": 19.99,
                    "currency": "EUR",
                    "status": "active",
                    },
                {
                    "product_id": 4,
                    "name": "Punk shader",
                    "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec fringilla mauris sed nibh scelerisque, ultrices ornare velit aliquam. Cras semper neque nec metus suscipit scelerisque. Nulla in lorem facilisis, efficitur libero nec, pellentesque eros. Aliquam at tortor odio. Nam pretium lobortis leo, vitae sodales eros sagittis fringilla. Sed ligula mauris, congue in finibus non, vulputate a neque. Nunc eleifend ex urna, id laoreet sapien aliquam eget. Donec lorem neque, efficitur et viverra eget, auctor sit amet nisl. Nulla sodales, nisl sit amet pharetra posuere, mi lorem cursus erat, sed ultricies quam urna a magna. Praesent tincidunt ligula in arcu condimentum lobortis. Nunc rhoncus lobortis nibh sit amet venenatis. Fusce eget cursus tellus. Proin molestie dolor eget nisl faucibus iaculis vel imperdiet tellus. Integer vel ligula sit amet lacus ornare facilisis vel et ipsum. Ut laoreet ipsum purus, sit amet posuere sapien eleifend et. In non felis a libero tempor vestibulum.",
                    "price": 19.99,
                    "currency": "EUR",
                    "status": "active",
                    },
                ]
        return Response({"items": len(data), "results": data})


# this is a proper product class implementation using models and serializers
# may need to interact better with data service API.


'''
@api_view(["GET"])
def listing_detail(request, id):

    try:
        product = Product.objects.get(pk=id)
    except product.DoesNotExist:
        return Response({"error": "Not Found."}, status=status.HTTP_404_NOT_FOUND)

    data = ProductSerializer(product).data
    return Response(data)
'''

'''
@api_view(["GET"])
def listing_full(request):

    query = Product.objects.all().order_by("id")
    data = ProductSerializer(query, many=true).data
    return Responde({"count": len(data), "results": data})
'''


class order_create(APIView):
    def get(self, request):
        # This API should have JWT_STRING, ?page=num&status=created
        # return a list or old orders
        data = {
                {"page": 1, "page_size": 10, "total": 3,
                 "items": [
                     {"order_id": 5501, "status": "created", "total": 62.5,
                      "currency": "EUR", "created_at": "2026-02-25T14:12:30Z"},
                     {"order_id": 5498, "status": "shipped", "total": 25.0,
                      "currency": "EUR",
                      "created_at": "2026-02-20T09:05:11Z"},
                     ]},
                }
        return (data)

    def post(self, request):
        # this API should have JWT_STRING and list of items [id] and quantatity
        # should also have billing address and name
        data = {
                "status": "created",
                "order_id": 5501,
                "total": 62.5,
                "currency": "EUR",
                }
        return (data)


class order_id(APIView):
    def get(self, request):
        # order id is needed, nothing else
        data = {
                "order_id": 5501, "status": "created", "currency": "EUR",
                "total": 62.5, "items": [
                    {"listing_id": 210, "title": "Mechanical Keyboard", "unit_price": 25.0,
                     "quantity": 2},
                    {"listing_id": 2, "title": "Keycap Set", "unit_price": 12.5, "quantity": 1},
                    ]


                }
        return (data)

    def PATCH(self, request):
        # this API needs JWT_STRING, order id and a status change, cancelled, delayed,etc
        return ({"message": "Updated", "order_id": 5501, "new_status": "cancelled"})


# USER API interfaces


class user_id(APIView):
    def get(self, request, id):

        user_data = {
                "Name": "Erik",
                "Products_owned": [1, 2, 5, 6],
                }
        return Response(user_data)
