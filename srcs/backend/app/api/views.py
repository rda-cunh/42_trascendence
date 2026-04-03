from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import APIException
from . import serializers
import requests

DATA_SERVICE = "http://data-service:9000/api/"

# TODO AUTH PROFILE GET
# TODO LISTING ID PATCH
# TODO LISTING ID DELETE
# TODO LISTING GET
# TODO ORDER GET, POST
# TODO ORDER ID GET, PATCH

def raiseForUpstream(method, endpoint, payload=None):
    try:
        upstream = requests.request(
                method=method,
                url=f"{DATA_SERVICE}{endpoint}",
                json=payload,
                timeout=5,
                )
        if upstream.status_code == 204 or not upstream.content:
            return (Response(status=upstream.status_code))
        try:
            body = upstream.json()
        except requests.exceptions.JSONDecodeError:
            body = {"detail": upstream.text or "Upstream returned non-JSON response"}
        return Response(body, status=upstream.status_code)
    except requests.RequestException as e:
        return Response({"error": "Data service unreachable",
                         "details": str(e)},
                        status=status.HTTP_502_BAD_GATEWAY)

# Auth API

# This api should have [user] [email] [passhash]
# this with JWT will work as request, raise_for_status, create JWT with upstream data send both JWT tokens


class auth_register(APIView):
    # this will will allow non authenticated methods in ["METHOD"]
    def get_self(self):
        if self.request.method in ["POST"]:
            return [AllowAny()]
        return [IsAuthenticated()]
    def post(self, request):
        AllowAny()
        serializer = serializers.authCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", "auth/register/", serializer.validated_data)

    def delete(self, request, id):
        # This api should have JWT_String, passhash, user id
        serializer = serializers.authDelete(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("DELETE", f"auth/register/{id}/", serializer.validated_data)


class auth_login(APIView):
    def post(self, request, id):
        # This api should have [user] [email] [passhash]
        serializer = serializers.authLogin(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", f"auth/login/{id}", serializer.validated_data)

    def delete(self, request, id):
        # This api should have JWT_String, passhash, user id

        return raiseForUpstream("DELETE", f"auth/login/{id}/")


class auth_profile(APIView):
    def get(self, request):
        # api should have JWT_STRING if does not match, different information is provided
        # serializer = serializers.authGet(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)
        #user_id = request.user_id

        return raiseForUpstream("GET", f"auth/profile/{user_id}/")

    def patch(self, request, id):
        # api should probably receive all user info that needs to be edited
        serializer = serializers.authPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"auth/profile/{id}/", serializer.validated_data)

    def delete(self, request, id):
        # api should probably receive all user info that needs to be deleted
        serializer = serializers.authProfileDelete(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("DELETE", f"auth/profile/{id}/")


class auth_password(APIView):
    def patch(self, request):
        serializer = serializers.authPassPatch(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"auth/profile/password/{id}/", serializer.validated_data)


class auth_address(APIView):
    def get(self, request, id):
        return raiseForUpstream("GET", f"auth/address/{id}/")

    def post(self, request, id):
        serializer = serializers.authAddressPost(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", f"auth/address/{id}/", serializer.validated_data)
    
    def patch(self, request, id):
        serializer = serializers.authAddressPatch(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"auth/address/{id}/", serializer.validated_data)

    def delete(self, request, id):
        return raiseForUpstream("DELETE", f"auth/address/{id}/")

# Product listings API


class listing_id(APIView):
    def get(self, request, id):
        # serializer = listingIdGet(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("GET", f"listings/{id}/")

    def patch(self, request, id):
        serializer = serializers.listingIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"listings/{id}/", serializer.validated_data)

    def delete(self, request, id):
        # TODO add authentication verification and provide id to data-service
        # serializer = serializers.listingIdPatch(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("DELETE", f"listings/{id}/")


class listing_full(APIView):
    def post(self, request):
        # serializer = listingsPost(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        # return raiseForUpstream("POST", "listings/", serializer.validated_data)
        return raiseForUpstream("POST", "listings/")

    def get(self, request):
        # will likely need to break down the url and send it either as body or link
        return raiseForUpstream("GET", "listings/")


class seller_id(APIView):
    def get(self, request, id):
        return raiseForUpstream("GET", f"listings/seller/{id}/")


class seller_product(APIView):
    def get(self, request, product_id):
        return raiseForUpstream("GET", f"listings/seller/{product_id}/")


class listings_image(APIView):
    def post(self, request, product_id):
        # serializer = listingsPost(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", f"listings/{product_id}/images/")

    def get(self, request, product_id):
        return raiseForUpstream("GET", f"listings/{product_id}/images/")

class listings_image_id(APIView):
    def get(self, request, product_id, image_id):
        return raiseForUpstream("GET", f"listings/{product_id}/images/{image_id}/")

    def delete(self, request, product_id, image_id):
        return raiseForUpstream("DELETE", f"listings/{product_id}/images/{image_id}/")


class listings_review(APIView):
    def post(self, request, product_id):
        # serializer = listingsPost(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", f"listings/{product_id}/review/")

    def get(self, request, product_id):
        return raiseForUpstream("GET", f"listings/{product_id}/review/")

    def patch(self, request, product_id, review_id):
        # serializer = listingsPost(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"listings/{product_id}/review/{review_id}/")

    def patch(self, request, product_id, review_id):
        # serializer = listingsPost(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"listings/{product_id}/review/{review_id}/")

# orders API


class order_create(APIView):

    # this get_permission is how i can set auth requirement for different methods.

    def get(self, request):
        # This API should have JWT_STRING, ?page=num&status=created
        # return a list or old orders

        return raiseForUpstream("GET", "orders/")

    def post(self, request):
        # this API should have JWT_STRING and list of items [id] and quantatity
        # should also have billing address and name
        serializer = serializers.orderIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", "orders/", serializer.validated_data)


class order_id(APIView):
    def get(self, request, id):

        return raiseForUpstream("GET", f"orders/{id}/")

    def patch(self, request, id):
        serializer = serializers.orderIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"orders/{id}/", serializer.validated_data)


class order_buyer_id(APIView):
    def get(self, request, id):

        return raiseForUpstream("GET", f"orders/buyer/{id}/")


class payment_id(APIView):
    def get(self, request, order_id):

        return raiseForUpstream("GET", f"payment/{id}/")

    def post(self, request, order_id):

        return raiseForUpstream("POST", f"payment/{id}/")

    def patch(self, request, order_id):

        return raiseForUpstream("PATCH", f"payment/{id}/")

    def delete(self, request, order_id):

        return raiseForUpstream("DELETE", f"payment/{id}/")


# PUBLIC APIs

# USER API interfaces

class user_list(APIView):
    def get(self, request):
        return raiseForUpstream("GET", "users/")


class user_id(APIView):
    def get(self, request, id):

        return raiseForUpstream("GET", f"users/{id}/")
