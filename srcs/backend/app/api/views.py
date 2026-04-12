from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.contrib.auth import get_user_model

from . import serializers
import requests
import os

# TODO LISTING ID PATCH
# TODO LISTING ID DELETE
# TODO LISTING GET
# TODO ORDER GET, POST
# TODO ORDER ID GET, PATCH

# data-service proxy configuration
def proxy_request(method, endpoint, data=None, params=None):
    """ helper function: proxy to data-service with auth headers"""
    base_url = settings.DATA_SERVICE_URL.rstrip("/")                            # added this to ensure no double slashes in the URL
    endpoint_path = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    url = f"{base_url}{endpoint_path}"
    headers = {"X-Internal-Token": settings.DATA_SERVICE_TOKEN}                 # to check with the team if we want to use this for internal auth between services

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

# shadow user management for JWT token geneation
def get_or_create_shadow_user(user_data):
    """Create or update a minimal local Django user bound to external user id."""
    
    # get django user model, extract fields and normalize data
    UserModel = get_user_model()
    external_id = int(user_data["id"])
    email = user_data.get("email") or ""
    name = user_data.get("name") or ""
    username_field = getattr(UserModel, "USERNAME_FIELD", "username")

    # prepare default values for user creation
    defaults = {}
    if hasattr(UserModel, username_field):
        defaults[username_field] = email or f"ext_{external_id}"
    if hasattr(UserModel, "email"):
        defaults["email"] = email
    if hasattr(UserModel, "first_name"):
        defaults["first_name"] = name

    # try to get user by external_id (stored in pk) or create if does not exist
    user, created = UserModel.objects.get_or_create(pk=external_id, defaults=defaults)

    # track for modifications and if new user set unusable password to prevent local login
    dirty = False
    if created and hasattr(user, "set_unusable_password"):
        user.set_unusable_password()
        dirty = True

    # sync username fields with values from data-service and ensure user is active
    if hasattr(UserModel, username_field):
        expected_username = email or f"ext_{external_id}"
        if getattr(user, username_field, None) != expected_username:
            setattr(user, username_field, expected_username)
            dirty = True
    if hasattr(user, "email") and user.email != email:
        user.email = email
        dirty = True
    if hasattr(user, "first_name") and user.first_name != name:
        user.first_name = name
        dirty = True
    if hasattr(user, "is_active") and not user.is_active:
        user.is_active = True
        dirty = True

    # save if anything was changed
    if dirty:
        user.save()

    #return the local user object for jwt generation 
    return user

# --- AUTH REGISTRATION ---
class auth_register(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = serializers.RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        #uses thte data service proxy to send validated data to data-service
        return proxy_request("POST", "/auth/register/", data=serializer.validated_data)

# --- AUTH LOGIN (issues JWT) ---
class auth_login(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        # Use dedicated LoginSerializer instead of TokenObtainPairView
        serializer = serializers.LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # use proxy to data-service to verify credentials
        login_data = {
            "email": serializer.validated_data["email"],
            "password": serializer.validated_data["password"]
        }
        user_resp = proxy_request("POST", "/auth/login/", login_data)
        
        if user_resp.status_code != 200:
            return user_resp
        
        # extract user data from data-service response
        user_data = user_resp.data # {"id": 1, "name": "...", "status": "Active", ...}

        # create/get shadow user so SimpleJWT can use the djanfo user model
        shadow_user = get_or_create_shadow_user(user_data)
        refresh = RefreshToken.for_user(shadow_user)
        refresh['external_user_id'] = str(user_data.get('id'))
        refresh['name'] = user_data.get('name')
        refresh['email'] = user_data.get('email')
        refresh['role'] = user_data.get('role')
        
        # customize token claims to include user data
        access_token = refresh.access_token
        access_token['external_user_id'] = str(user_data.get('id'))
        access_token['name'] = user_data.get('name')
        access_token['email'] = user_data.get('email')
        access_token['role'] = user_data.get('role')
        
        response = Response({
            "access": str(access_token),
            "user": user_data,
        })
        
        # set httpOnly refresh token cookie
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
        payload = {
            "oldPass": serializer.validated_data["password"],
            "newPass": serializer.validated_data["new_password"],
        }
        return proxy_request(
            "PATCH",
            f"/auth/profile/password/{request.user.id}/",
            payload
        )

# Product listings API

class listing_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/listings/{id}/")

    def patch(self, request, id):
        serializer = serializers.listingIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        return proxy_request("PATCH", f"/listings/{id}", serializer.validated_data)

    def delete(self, request, id):
        # TODO add authentication verification and provide id to data-service
        return proxy_request("DELETE", f"/listings/{id}")


class listing_full(APIView):
    def post(self, request):
        return proxy_request("POST", "/listings/", request.data)

    def get(self, request):
        return proxy_request("GET", "/listings/")


class listings_review(APIView):
    def post(self, request, product_id):
        return proxy_request("POST", f"/listings/{product_id}/review/")

    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/{product_id}/review/")

    def patch(self, request, product_id, review_id):
        return proxy_request("PATCH", f"/listings/{product_id}/review/{review_id}/")


class seller_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/listings/seller/{id}/")


class seller_product(APIView):
    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/seller/{product_id}/")


class listings_image(APIView):
    def post(self, request, product_id):
        return proxy_request("POST", f"/listings/{product_id}/images/")

    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/{product_id}/images/")


class listings_image_id(APIView):
    def get(self, request, product_id, image_id):
        return proxy_request("GET", f"/listings/{product_id}/images/{image_id}/")

    def delete(self, request, product_id, image_id):
        return proxy_request("DELETE", f"/listings/{product_id}/images/{image_id}/")


# orders API

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
        return proxy_request("POST", "/orders/", request.data)


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
        return proxy_request("PATCH", f"/orders/{id}", request.data)


class order_buyer_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/orders/buyer/{id}/")


class payment_id(APIView):
    def get(self, request, order_id):
        return proxy_request("GET", f"/orders/{order_id}/payment/")

    def post(self, request, order_id):
        return proxy_request("POST", f"/orders/{order_id}/payment/", request.data)

    def patch(self, request, order_id):
        return proxy_request("PATCH", f"/orders/{order_id}/payment/", request.data)

    def delete(self, request, order_id):
        return proxy_request("DELETE", f"/orders/{order_id}/payment/")


# PUBLIC APIs

class user_list(APIView):
    def get(self, request):
        return proxy_request("GET", "/users/")


# USER API interfaces


class user_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/users/{id}/")
