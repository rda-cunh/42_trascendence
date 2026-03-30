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
        try:
            body = upstream.json()
        except requests.exceptions.JSONDecodeError:
            body = {"detail": upstream.text or "Upstream returned non-JSON response"}
        return Response(body, status=upstream.status_code)
    except requests.RequestException as e:
        return Response({"error": "Data service unreachable",
                         "details": str(e)},
                        status=status.HTTP_502_BAD_GATEWAY)

def silentUpstream(method, endpoint, payload=None):
    try:
        upstream = requests.request(
                method=method,
                url=f"{DATA_SERVICE}{endpoint}",
                json=payload,
                timeout=5,
                )
        return Response(status=upstream.status_code)
    except requests.RequestException as e:
        return Response({"error": "Data service unreachable",
                         "details": str(e)},
                        status=status.HTTP_502_BAD_GATEWAY)

# Auth API

# This api should have [user] [email] [passhash]
# this with JWT will work as request, raise_for_status, create JWT with upstream data send both JWT tokens


class auth_register(APIView):
    def post(self, request):
        serializer = serializers.authCreate(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", "auth/register/", serializer.validated_data)


class auth_delete(APIView):
    def delete(self, request, id):
        # This api should have JWT_String, passhash, user id
        # serializer = serializers.authCreate(data=request.data)
        # serializer.is_valid(raise_exception=True)

        return silentUpstream("DELETE", f"auth/register/{id}/", None)


class auth_login(APIView):
    def post(self, request, id):
        # This api should have [user] [email] [passhash]
        serializer = serializers.authLogin(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", f"auth/login/{id}", serializer.validated_data)

    def delete(self, request, id):
        # This api should have JWT_String, passhash, user id
        # serializer = serializers.authLogout(data=request.data)
        # serializer.is_valid(raise_exception=True)

        return silentUpstream("DELETE", f"auth/login/{id}/", None)


class auth_profile(APIView):
    def get(self, request):
        # api should have JWT_STRING if does not match, different information is provided
        # serializer = serializers.authGet(data=request.data, partial=True)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("GET", f"auth/profile/{id}/", None)

    def patch(self, request, id):
        # api should probably receive all user info that needs to be edited
        serializer = serializers.authPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"auth/profile/{id}/", serializer.validated_data)

    def delete(self, request, id):
        # api should probably receive all user info that needs to be deleted
        serializer = serializers.authDelete(data=request.data)
        serializer.is_valid(raise_exception=True)

        return silentUpstream("DELETE", f"auth/profile/{id}/", None)


class auth_password(APIView):
    def patch(self, request):
        serializer = serializers.authPassPatch(data=request.data)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("PATCH", f"auth/profile/password/{id}/", serializer.validated_data)

# Product listings API


class listing_id(APIView):
    def get(self, request, id):
        # serializer = listing_id_get(data=request.data, partial=True)
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

        return silentUpstream("DELETE", f"listings/{id}/", None)


class listing_full(APIView):
    def post(self, request):
        serializer = listingsPost(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", "listings/", serializer.validated_data)

    def get(self, request):
        # will likely need to break down the url and send it either as body or link
        return raiseForUpstream("GET", "listings/", None)


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

        return raiseForUpstream("GET", "orders/", None)

    def post(self, request):
        # this API should have JWT_STRING and list of items [id] and quantatity
        # should also have billing address and name
        serializer = serializers.orderIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        return raiseForUpstream("POST", "orders/", serializer.validated_data)


class order_id(APIView):
    def get(self, request, id):
        # orders id is needed, nothing else

        return raiseForUpstream("GET", f"orders/{id}", None)

    def patch(self, request, id):
        serializer = serializers.orderIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        # payload = dict(serializer.validated_data)
        # payload["updated_by"] = request.user.id

        return raiseForUpstream("PATCH", f"orders/{id}", serializer.validated_data)


# USER API interfaces


class user_id(APIView):
    def get(self, request, id):
        # serializer = serializers.authDelete(data={"user_id": id, **request.data)
        # serializer.is_valid(raise_exception=True)

        return raiseForUpstream("GET", f"users/{id}/", None)
