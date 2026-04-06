from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import TokenError

from . import serializers
import requests
import os

DATA_SERVICE = "http://data-service:9000/api"

# TODO LISTING ID PATCH
# TODO LISTING ID DELETE
# TODO LISTING GET
# TODO ORDER GET, POST
# TODO ORDER ID GET, PATCH

# data-service proxy configuration
def proxy_request(method, endpoint, data=None, params=None):
    """ helper function: proxy to data-service with auth headers"""
    url = f"{DATA_SERVICE_URL}{endpoint}"
    headers = {"X-Internal-Token": DATA_SERVICE_TOKEN}

    try:
        resp = requests.request(
            method=method,
            url=url,
            json=data,
            params=params,
            headers=headers,
            timeout=5,
        )

        # handle JSON or empty responses
        try:
            content = resp.json()
        except ValueError:  # Not JSON (204 No Content)
            content = {"error": resp.reason, "status": resp.status_code}
        
        # return data-service response directly (including 4xx errors)
        return Response(content, status=resp.status_code)

    except requests.RequestException as e:
        return Response(
            {"error": "Data service unreachable", "details": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

def proxy_request(method, endpoint, data=None, params=None):
    """ helper function: proxy to data-service with auth headers"""
    url = f"{DATA_SERVICE}{endpoint}"
    headers = {"X-Internal-Token": INTERNAL_TOKEN}

    try:
        resp = requests.request(
            method=method,
            url=url,
            json=data,
            params=params,
            headers=headers,
            timeout=5,
        )
    # this will return data-service response directly (including 4xx errors)
    return Response(resp.json() if resp.content else {"error": resp.reason}, status=resp.status_code)
    except requests.RequestException as e:
        return Response(
            {"error": "Data service unreachable", "details": str(e)},
            status=status.HTTP_502_BAD_GATEWAY
        )

# --- AUTH REGISTRATION ---
class auth_register(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = serializers.RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        #uses thte data service proxy to send validated data to data-service
        return proxy_request("POST", "/auth/register/", data=serializer.validated_data)

# --- AUTH LOGIN (issues JWT) ---
class auth_login(TokenObtainPairView):
    serializer_class = serializers.CustomTokenPairSerializer
    permission_classes = [AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # use proxy to data-service to verify credentials
        login_data = {
            "email": serializer.validated_data["email"],
            "password": serializer.validated_data["password"]
        }
        user_resp = proxy_request("POST", "/auth/login/", login_data)
        
        if user_resp.status_code != 200:
            return user_resp
        
        # as jwt expects a django user object when issuing the token (when running ´RefreshToken.for_user(fake_user)´) whe need to transform our JSON info into an django object manually
        # we start extracting user data from data-service
        user_data = user_resp.data # {"id": 1, "name": "...", "role": "..."}

        # we create a fake user object for jwt
        class FakeUser:
            def __init__(self, data):
                self.id = data["id"]
                self.is_active = data.get("status") == "Active"
                self.email = data.get("email")
        fake_user = FakeUser(user_data)

        # issue JWT tokens
        refresh = RefreshToken.for_user(fake_user)
        
        response = Response({
            "token": str(refresh.access_token),
            "user": user_data,
        })
        
        # set httpOnly refresh cookie
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,  
            samesite="Strict",
            max_age=7*24*3600,
            path="/api/auth/",
        )
        return response

# --- AUTH LOGOUT ---
class auth_logout(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # django SQLite blacklist
            except TokenError:
                pass
        
        response = Response({"detail": "Logged out."})
        response.delete_cookie("refresh_token", path="/api/auth/")
        return response

# --- AUTH REFRESH (when jwt access token expires)---
class auth_refresh(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "No refresh token."}, status=401)
        
        try:
            token = RefreshToken(refresh_token)     # validate and use refresh token
            response = Response({"token": str(token.access_token)})    # new access token
            response.set_cookie(            # new refresh token
                key="refresh_token",
                value=str(token), 
                httponly=True,
                secure=True,
                samesite="Strict",
                max_age=7*24*3600,
                path="/api/auth/",
            )
            return response
        except TokenError:
            return Response({"detail": "Invalid refresh token."}, status=401)

# --- AUTH PROFILE (take user_id from JWT)---
class auth_profile(APIView):
    
    # check permissions, allowing costumization later if needed
    def get_permissions(self):
        return [IsAuthenticated()]
    
    # extracts the user from the JWT
    def get(self, request):
        return proxy_request("GET", f"/auth/profile/{request.user.id}/")
    
    # sends prepared data to data service to update profile
    def patch(self, request):
        serializer = serializers.ProfilePatchSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        return proxy_request("PATCH", f"/auth/profile/{request.user.id}/", serializer.validated_data)
    
    # delete account method
    def delete(self, request):
        serializer = serializers.DeleteAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return proxy_request("DELETE", f"/auth/profile/{request.user.id}/", serializer.validated_data)

# --- AUTH PASSWORD ---
class auth_password(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        serializer = serializers.ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return proxy_request(
            "PATCH",
            f"/auth/profile/password/{request.user.id}/",
            serializer.validated_data
        )

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
        try:
            upstream = requests.get(
                    f"{DATA_SERVICE}/users/{id}/",
                    request.data,
                    timeout=5,
            ) # this works as intended and I can perfectly communicate with data-service
            # upstream.raise_for_status() # will go to exception in case of error code
            return Response(upstream.json(), status=upstream.status_code)
        except requests.RequestException as e:
            return Response({"error": "Data service unreachable",
                             "details": str(e)},
                            status=status.HTTP_502_BAD_GATEWAY)
