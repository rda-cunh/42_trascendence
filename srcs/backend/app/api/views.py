from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import APIException
from . import serializers
import requests

DATA_SERVICE = "http://data-service:9000/api"

# TODO AUTH PROFILE GET
# TODO LISTING ID PATCH
# TODO LISTING ID DELETE
# TODO LISTING GET
# TODO ORDER GET, POST
# TODO ORDER ID GET, PATCH

# Auth API


class auth_register(APIView):
    def post(self, request):
        # This api should have [user] [email] [passhash]
        # this with JWT will work as request, raise_for_status, create JWT with upstream data send both JWT tokens
        serializer = serializers.authCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.post(
                    f"{DATA_SERVICE}/users/",
                    # f"{DATA_SERVICE}/auth/register/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def delete(self, request):
        # This api should have JWT_String, passhash, user id
        serializer = serializers.authDelete(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.delete(
                    f"{DATA_SERVICE}/auth/register/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


class auth_login(APIView):
    def post(self, request):
        # This api should have [user] [email] [passhash]
        serializer = serializers.authLogin(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.post(
                    f"{DATA_SERVICE}/auth/login/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def delete(self, request):
        # This api should have JWT_String, passhash, user id
        serializer = serializers.authLogout(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.delete(
                    f"{DATA_SERVICE}/auth/login/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


class auth_profile(APIView):
    def get(self, request):
        # api should have JWT_STRING if does not match, different information is provided
        # serializer = serializers.authGet(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)
        try:
            upstream = requests.get(
                    f"{DATA_SERVICE}/auth/profile/",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def patch(self, request):
        # api should probably receive all user info that needs to be edited
        serializer = serializers.authPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.patch(
                    f"{DATA_SERVICE}/auth/profile/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def delete(self, request):
        # api should probably receive all user info that needs to be deleted
        serializer = serializers.authDelete(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.delete(
                    f"{DATA_SERVICE}/auth/profile/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


class auth_password(APIView):
    def patch(self, request):
        serializer = serializers.authPassPatch(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.patch(
                    f"{DATA_SERVICE}/auth/profile/password/",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

# Product listings API


class listing_id(APIView):
    def get(self, request, id):
        # serializer = listing_id_get(data=request.data, partial=true)
        # serializer.is_valid(raise_exception=true)
        try:
            upstream = requests.get(
                    f"{DATA_SERVICE}/listings/{id}/",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def patch(self, request, id):
        serializer = serializers.listingIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.patch(
                    f"{DATA_SERVICE}/listings/{id}",
                    json=serializer.validated_data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

    def delete(self, request, id):
        # TODO add authentication verification and provide id to data-service
        # serializer = serializers.listingIdPatch(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.patch(
                    f"{DATA_SERVICE}/listings/{id}",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


class listing_full(APIView):
    def post(self, request):
        # serializer = listingsPost(data=request.data, partial=true)
        # serializer.is_valid(raise_exception=true)
        try:
            upstream = requests.post(
                    f"{DATA_SERVICE}/listings/",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)

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


# uuid4 from fastAPI

# def get_permission(self):
#     if self.request.method in ["POST"]:
#         return [IsAuthenticated()]
#     return [AllowAny()]

class order_create(APIView):

    # this get_permission is how i can set auth requirement for different methods.

    def get(self, request):
        # This API should have JWT_STRING, ?page=num&status=created
        # return a list or old orders
        data = {
                "page": 1, "page_size": 10, "total": 3,
                 "items": [
                     {"order_id": 5501, "status": "created", "total": 62.5,
                      "currency": "EUR", "created_at": "2026-02-25T14:12:30Z"},
                     {"order_id": 5498, "status": "shipped", "total": 25.0,
                      "currency": "EUR",
                      "created_at": "2026-02-20T09:05:11Z"},
                     ],
                }
        return Response(data)

    def post(self, request):
        # this API should have JWT_STRING and list of items [id] and quantatity
        # should also have billing address and name
        # serializer = serializers.orderIdPatch(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.post(
                    f"{DATA_SERVICE}/orders/",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


class order_id(APIView):
    def get(self, request, id):
        # order id is needed, nothing else
        data = {
                "order_id": id, "status": "created", "currency": "EUR",
                "total": 62.5, "items": [
                    {"listing_id": 210, "title": "Mechanical Keyboard", "unit_price": 25.0,
                     "quantity": 2},
                    {"listing_id": 2, "title": "Keycap Set", "unit_price": 12.5, "quantity": 1},
                    ]


                }
        return Response(data)

    def patch(self, request, id):
        # serializer = serializers.orderIdPatch(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)
        # payload = dict(serializer.validated_data)
        # payload["updated_by"] = request.user.id

        try:
            upstream = requests.patch(
                    f"{DATA_SERVICE}/orders/{id}",
                    request.data,
                    timeout=5,
            )
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)


# USER API interfaces


class user_id(APIView):
    def get(self, request, id):
        serializer = serializers.userId_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            upstream = requests.get(
                    f"{DATA_SERVICE}/user/{id}/",
                    request.data,
                    timeout=5,
            ) # this works as intended and I can perfectly communicate with data-service
            # upstream.raise_for_status() # will go to exception in case of error code
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)
