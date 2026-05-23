from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.conf import settings
from django.contrib.auth import get_user_model
from django.shortcuts import redirect as django_redirect
from urllib.parse import urlencode
from .permissions import IsAdminRole
from decimal import Decimal

from . import serializers
from . import presence as presence_store
import requests
import secrets
import json

# TODO LISTING ID PATCH
# TODO LISTING ID DELETE
# TODO LISTING GET
# TODO ORDER GET, POST
# TODO ORDER ID GET, PATCH

# admin check for non-admin exclusive behaviours
def is_admin(request):
    token = request.auth
    if token is None:
        return False
    return token['role'] == 'admin'

# utility to convert non-JSON-serializable values (like Decimal) into strings for safe JSON responses
def make_json_safe(value):
    """Convert DRF/Python values like Decimal into JSON-serializable primitives."""
    if isinstance(value, Decimal):
        return str(value)

    if isinstance(value, dict):
        return {key: make_json_safe(val) for key, val in value.items()}

    if isinstance(value, list):
        return [make_json_safe(item) for item in value]

    if isinstance(value, tuple):
        return [make_json_safe(item) for item in value]

    return value

# data-service proxy configuration
def proxy_request(method, endpoint, data=None, params=None):
    """ helper function: proxy to data-service with auth headers"""
    base_url = settings.DATA_SERVICE_URL.rstrip("/")
    endpoint_path = endpoint if endpoint.startswith("/") else f"/{endpoint}"
    url = f"{base_url}{endpoint_path}"
    headers = {"X-Internal-Token": settings.DATA_SERVICE_TOKEN}
    safe_data = make_json_safe(data)

    try:
        resp = requests.request(
            method=method,
            url=url,
            json=safe_data,
            params=params,
            headers=headers,
            timeout=5,
        )

        # special handling for 204 No Content or empty responses
        if resp.status_code == 204 or not resp.content:
            return (Response(status=resp.status_code))

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


class grafana_auth(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    def initial(self, request, *args, **kwargs):
        if 'HTTP_AUTHORIZATION' not in request.META:
            token = request.COOKIES.get('access_token')
            if token:
                request.META['HTTP_AUTHORIZATION'] = f'Bearer {token}'
        super().initial(request, *args, **kwargs)

    def get(self, request):
        reply = Response(status=200)
        reply['X-Grafana-User'] = request.user.email
        reply['X-Grafana-Role'] = 'Admin'
        return reply


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
            path="/",
        )

        # set httpOnly access token cookie (so the browser sends it to /metrics etc.)
        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            path="/",
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
        response.delete_cookie("refresh_token", path="/")
        response.delete_cookie("access_token", path="/")
        return response

# --- AUTH REFRESH (when jwt access token expires)---
class auth_refresh(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            return Response({"detail": "No refresh token."}, status=401)
        
        UserModel = get_user_model()
        try:
            token = RefreshToken(refresh_token)     # validate and use refresh token
            user = UserModel.objects.get(pk=token["user_id"])
            new_refresh = RefreshToken.for_user(user)

            # keep custom claims aligned between refresh/access pairs
            for claim in ("external_user_id", "name", "email", "role"):
                if claim in token:
                    new_refresh[claim] = token[claim]

            new_access_token = new_refresh.access_token

            response = Response({"access": str(new_access_token)})
            response.set_cookie(
                key="refresh_token",
                value=str(new_refresh),
                httponly=True,
                secure=True,
                samesite="Strict",
                max_age=7 * 24 * 3600,
                path="/",
            )
            response.set_cookie(
                key="access_token",
                value=str(new_access_token),
                httponly=True,
                secure=True,
                samesite="Strict",
                max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
                path="/",
            )

            token.blacklist()
            return response
        except (TokenError, UserModel.DoesNotExist):
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

# --- OAUTH 42 - redirect user to 42 login ---
class auth_42_redirect(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        state = secrets.token_urlsafe(16) # CSRF (Cross Site Request Forgery) protection
        params = urlencode({
            "client_id":     settings.FORTYTWO_CLIENT_ID,
            "redirect_uri":  settings.FORTYTWO_REDIRECT_URI,
            "response_type": "code",
            "scope":         "public",
            "state":         state,
        })
        response = django_redirect(f"https://api.intra.42.fr/oauth/authorize?{params}")
        response.set_cookie(
            key="oauth42_state",
            value=state,
            httponly=True,
            secure=True,
            samesite="Lax",
            max_age=300,    # state valid for 5 minutes
            path="/api/auth/42/",
        )
        return response

# --- OAUTH 42 - receives callback and issues tokens ---
class auth_42_callback(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        def oauth_redirect(base_url, payload):
            separator = "&" if "?" in base_url else "?"
            return django_redirect(f"{base_url}{separator}{urlencode(payload)}")

        provider_error = request.GET.get("error")
        if provider_error:
            return oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": provider_error})

        code = request.GET.get("code")

        callback_state = request.GET.get("state")   # request state from callback query params
        stored_state = request.COOKIES.get("oauth42_state")

        if not callback_state or not stored_state or callback_state != stored_state:
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "invalid_oauth_state"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        if not code:
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "missing_code"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        # exchange code for 42 access token
        token_resp = requests.post("https://api.intra.42.fr/oauth/token", data={
            "grant_type":    "authorization_code",
            "client_id":     settings.FORTYTWO_CLIENT_ID,
            "client_secret": settings.FORTYTWO_CLIENT_SECRET,
            "code":          code,
            "redirect_uri":  settings.FORTYTWO_REDIRECT_URI,
        })
        if token_resp.status_code != 200:
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "token_exchange_failed"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        access_token_42 = token_resp.json().get("access_token")

        # fetch user profile from 42 API
        profile_resp = requests.get(
            "https://api.intra.42.fr/v2/me",
            headers={"Authorization": f"Bearer {access_token_42}"},
        )
        if profile_resp.status_code != 200:
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "profile_fetch_failed"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        profile = profile_resp.json()

        # define user data structure expected by data-service from 42 profile fields
        user_data_42 = {
            "name":     profile["displayname"],
            "email":    profile["email"],
            "phone":    None,
            "password": secrets.token_urlsafe(32),   # random unusable password
            "avatar_url": profile["image"]["link"],  # 42 provides avatar
        }

        # register in data-service
        reg_resp = proxy_request("POST", "/auth/register/", data=user_data_42)

        if reg_resp.status_code == 201:
            # user created — use the returned user object
            user_data = reg_resp.data

        elif reg_resp.status_code == 409:
            # account already exists — fetch existing user (re-login via 42 OAuth)
            lookup_resp = proxy_request("GET", "/auth/by-email/", params={"email": user_data_42["email"]})
            if lookup_resp.status_code != 200:
                response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "user_lookup_failed"})
                response.delete_cookie("oauth42_state", path="/api/auth/42/")
                return response
            user_data = lookup_resp.data

        elif reg_resp.status_code == 400:
            # validation error from data-service 
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "registration_failed"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        else:
            response = oauth_redirect(settings.OAUTH_FAILURE_REDIRECT, {"error": "data_service_unavailable"})
            response.delete_cookie("oauth42_state", path="/api/auth/42/")
            return response

        # user_data now has the data-service assigned id and we can create the shadow user for JWT generation
        shadow_user = get_or_create_shadow_user(user_data)

        # update user_data with any additional info from 42 profile 
        user_data["name"] = profile.get("displayname") or user_data.get("name")
        user_data["email"] = profile.get("email") or user_data.get("email")
        user_data["role"] = user_data.get("role", "user")
        oauth_external_user_id = str(profile["id"])

        # generate JWT tokens with info from 42 profile and data-service user data
        refresh = RefreshToken.for_user(shadow_user)
        refresh["external_user_id"] = oauth_external_user_id
        refresh["name"]  = user_data.get("name")
        refresh["email"] = user_data.get("email")
        refresh["role"]  = user_data.get("role", "user")

        access_token = refresh.access_token
        access_token["external_user_id"] = oauth_external_user_id
        access_token["name"]  = user_data.get("name")
        access_token["email"] = user_data.get("email")
        access_token["role"]  = user_data.get("role", "user")

        # same response as auth_login so frontend handle both cases the same way
        response = oauth_redirect(
            settings.OAUTH_SUCCESS_REDIRECT,
            {
                "access": str(access_token),
                "user": json.dumps(user_data),
            },
        )
        response.set_cookie(
            key="refresh_token",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=7 * 24 * 3600,
            path="/",
        )
        response.set_cookie(
            key="access_token",
            value=str(access_token),
            httponly=True,
            secure=True,
            samesite="Strict",
            max_age=int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds()),
            path="/",
        )
        response.delete_cookie("oauth42_state", path="/api/auth/42/")
        return response

# --- CHAT API interfaces ---
def ensure_chat_member(request, conversation_id):
    """
    Validate that the authenticated user belongs to the conversation
    before allowing message history access through this proxy layer.
    """
    conversation_response = proxy_request(
        "GET",
        f"/chat/conversations/by-id/{conversation_id}/"
    )

    if conversation_response.status_code != 200:
        return conversation_response

    conversation = conversation_response.data or {}
    allowed_user_ids = {
        conversation.get("buyer_id"),
        conversation.get("seller_id"),
    }

    if request.user.id not in allowed_user_ids:
        raise PermissionDenied("You do not have permission to access this conversation.")

    return None

def normalize_chat_conversation_for_user(user_id, conversation):
    """
    Normalize a raw conversation object from data-service into a shape that is
    stable for frontend use, including the correct 'other' participant.
    """
    if not isinstance(conversation, dict):
        return conversation

    buyer_id = conversation.get("buyer_id")
    seller_id = conversation.get("seller_id")
    buyer = conversation.get("buyer") or {}
    seller = conversation.get("seller") or {}
    listing = conversation.get("listing") or {}

    is_buyer = user_id == buyer_id
    other_id = seller_id if is_buyer else buyer_id
    other_user = seller if is_buyer else buyer

    normalized = dict(conversation)
    normalized["other_id"] = other_id
    normalized["other_user"] = other_user
    normalized["listing_name"] = listing.get("name")
    normalized["listing_image_hash"] = listing.get("image_hash")
    normalized["listing_price"] = listing.get("price")

    return normalized


def normalize_chat_conversation_response(user_id, payload):
    if isinstance(payload, list):
        return [normalize_chat_conversation_for_user(user_id, item) for item in payload]
    if isinstance(payload, dict):
        return normalize_chat_conversation_for_user(user_id, payload)
    return payload


class chat_conversations(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """ lists all conversations for the user (retrieved from JWT) """
        upstream_response = proxy_request(
            "GET",
            f"/chat/conversations/{request.user.id}/"
        )

        if upstream_response.status_code != 200:
            return upstream_response

        return Response(
            normalize_chat_conversation_response(request.user.id, upstream_response.data),
            status=upstream_response.status_code,
        )

    def post(self, request):
        """ creates or fetches the conversation for a listing """

        serializer = serializers.ChatConversationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        listing_id = serializer.validated_data["listing_id"]

        listing_response = proxy_request("GET", f"/listings/{listing_id}/")
        if listing_response.status_code != 200:
            return listing_response

        listing_data = listing_response.data or {}
        seller_id = (
            listing_data.get("seller_id")
            or listing_data.get("user_id")
            or listing_data.get("owner_id")
        )

        if not seller_id:
            return Response(
                {"detail": "Could not resolve seller for this listing."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payload = {
            "listing_id": listing_id,
            "user_id": request.user.id,
            "seller_id": seller_id,
        }

        upstream_response = proxy_request("POST", "/chat/conversations/", data=payload)

        if upstream_response.status_code not in (200, 201):
            return upstream_response

        return Response(
            normalize_chat_conversation_response(request.user.id, upstream_response.data),
            status=upstream_response.status_code,
        )


class chat_messages(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, conversation_id):
        """ gets message history for one conversation """
        permission_error = ensure_chat_member(request, conversation_id)
        if permission_error is not None:
            return permission_error

        return proxy_request(
            "GET",
            f"/chat/conversations/{conversation_id}/messages/"
        )

# --- PRESENCE API interfaces ---
class presence_ping(APIView):
    """ POST: refresh the caller online TTL key in Redis """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        presence_store.mark_online(request.user.id)
        return Response(status=status.HTTP_204_NO_CONTENT)

class presence_query(APIView):
    """ GET: return {user_id: bool} for a comma-separated ?ids= list. Public. """
    permission_classes = [AllowAny]

    MAX_IDS = 200

    def get(self, request):
        raw = request.query_params.get("ids", "")
        if not raw:
            return Response({})
        try:
            user_ids = [int(x) for x in raw.split(",") if x.strip()]
        except ValueError:
            return Response(
                {"detail": "ids must be comma-separated integers"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if len(user_ids) > self.MAX_IDS:
            return Response(
                {"detail": f"too many ids (max {self.MAX_IDS})"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(presence_store.are_online(user_ids))

# --- FOLLOW API interfaces ---
class follow_action(APIView):
    """POST: follow a user, DELETE: unfollow a user. The follower id comes from the JWT and not the body."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = serializers.FollowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {
            "user_id": request.user.id,
            "following_id": serializer.validated_data["following_id"],
        }
        return proxy_request("POST", "/follow/add/", data=payload)

    def delete(self, request):
        serializer = serializers.FollowActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payload = {
            "user_id": request.user.id,
            "following_id": serializer.validated_data["following_id"],
        }
        return proxy_request("DELETE", "/follow/remove/", data=payload)

class follow_following(APIView):
    """GET list of users that user_id follows. This is public."""
    def get(self, request, user_id):
        params = {k: request.query_params[k]
                  for k in ("limit", "offset") if k in request.query_params}
        return proxy_request("GET", f"/follow/following/{user_id}/", params=params)

class follow_followers(APIView):
    """GET list of users following user_id. Public."""
    def get(self, request, user_id):
        params = {k: request.query_params[k]
                  for k in ("limit", "offset") if k in request.query_params}
        return proxy_request("GET", f"/follow/followers/{user_id}/", params=params)

class follow_counts(APIView):
    """GET follower and following counts for user_id. This is public."""
    def get(self, request, user_id):
        # merged the two calls here. Evaluate later if this needs to be separated.
        followers = proxy_request("GET", f"/follow/followers-count/{user_id}/")
        following = proxy_request("GET", f"/follow/following-count/{user_id}/")
        if followers.status_code != 200 or following.status_code != 200:
            return Response({"detail": "Upstream error"}, status=502)
        return Response({
            "followers": followers.data["num"],
            "following": following.data["num"],
        })


class follow_feed(APIView):
    def get(self, request):
        return proxy_request("GET", f"/follow/feed/{request.user.id}/")

# --- NOTIFICATIONS ---

class notification_list(APIView):
    """GET list of notifications for the current user. Supports ?limit, ?offset, ?unread_only=true."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        allowed = ("limit", "offset", "unread_only")
        params = {k: request.query_params[k]
                  for k in allowed if k in request.query_params}
        return proxy_request(
            "GET",
            f"/notifications/{request.user.id}/",
            params=params,
        )

class notification_unread_count(APIView):
    """GET the unread count. Backed by an index on (recipient_id, read_at)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return proxy_request(
            "GET",
            f"/notifications/{request.user.id}/unread-count/",
        )

class notification_mark_read(APIView):
    """POST {ids: [int]} — mark specific notifications as read. Data-service should ignore ids that don't belong to the current user."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = serializers.NotificationReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return proxy_request(
            "POST",
            f"/notifications/{request.user.id}/read/",
            data={"ids": serializer.validated_data["ids"]},
        )

class notification_mark_all_read(APIView):
    """POST no body — mark every unread notification for the current user as read."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return proxy_request(
            "POST",
            f"/notifications/{request.user.id}/read-all/",
        )

# Product listings API

class listing_id(APIView):
    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/{product_id}/")

    def patch(self, request, product_id):
        serializer = serializers.listingIdPatch(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if request.user.id != product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to edit this product.")
        return proxy_request("PATCH", f"/listings/{product_id}/", serializer.validated_data)

    def delete(self, request, product_id):
        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if request.user.id != product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to delete this product.")
        return proxy_request("DELETE", f"/listings/{product_id}/")


class listing_full(APIView):
    def post(self, request):
        return proxy_request("POST", "/listings/", request.data)

    def get(self, request):
        return proxy_request("GET", "/listings/")

class listings_image(APIView):
    def get(self, request, product_id):
        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if not request.user.id == product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to view this product images metadata.")
        return proxy_request("GET", f"/listings/{product_id}/images/")

    def post(self, request, product_id):
        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if not request.user.id == product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to edit this product.")
        return proxy_request("POST", f"/listings/{product_id}/images/", request.data)

class listing_image_full(APIView):
    def get(self, request):
        return proxy_request("GET", f"/listings/images/")

class listings_image_id(APIView):
    def get(self, request, product_id, image_id):
        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if not request.user.id == product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to view this product image metadata.")
        return proxy_request("GET", f"/listings/{product_id}/images/{image_id}")

    def delete(self, request, product_id, image_id):
        product_data = proxy_request("GET", f"/listings/{product_id}/").data
        if not request.user.id == product_data.get("seller_id") and not is_admin(request):
            raise PermissionDenied("You do not have permission to edit this product.")
        return proxy_request("DELETE", f"/listings/{product_id}/images/{image_id}")

class listings_review(APIView):
    def post(self, request, product_id):
        return proxy_request("POST", f"/listings/{product_id}/review/")

    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/{product_id}/review/")

    def patch(self, request, product_id, review_id):
        return proxy_request("PATCH", f"/listings/{product_id}/review/{review_id}/")


class seller_id(APIView):
    def get(self, request, user_id):
        return proxy_request("GET", f"/listings/seller/{user_id}/")


class seller_product(APIView):
    def get(self, request, product_id):
        return proxy_request("GET", f"/listings/seller/{product_id}/")


# class listings_image(APIView):
#    def post(self, request, product_id):
#        product_data = proxy_request("GET", f"/listings/{product_id}/").data
#        if not request.user.id == product_data.get("owner_id") or is_admin(request):
#            raise PermissionDenied("You do not have permission to add this image.")
#        return proxy_request("POST", f"/listings/{product_id}/images/")
#
#
#    def get(self, request, product_id):
#        return proxy_request("GET", f"/listings/{product_id}/images/")


# class listings_image_id(APIView):
#    def get(self, request, product_id, image_id):
#        return proxy_request("GET", f"/listings/{product_id}/images/{image_id}/")
#
#    def delete(self, request, product_id, image_id):
#        product_data = proxy_request("GET", f"/listings/{product_id}/").data
#        if not request.user.id == product_data.get("owner_id") or is_admin(request):
#            raise PermissionDenied("You do not have permission to edit this product.")
#        return proxy_request("DELETE", f"/listings/{product_id}/images/{image_id}/")


# orders API

class order_create(APIView):

    def get(self, request):
        # This API should have JWT_STRING, ?page=num&status=created
        # return a list or old orders
        return proxy_request("GET", "/orders/")

    def post(self, request):
        # this API should have JWT_STRING and list of items [id] and quantatity
        # should also have billing address and name
        return proxy_request("POST", "/orders/", request.data)


class order_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/orders/{order_id}/")

    def patch(self, request, id):
        return proxy_request("PATCH", f"/orders/{order_id}", request.data)


class order_buyer_id(APIView):
    def get(self, request, id):
        return proxy_request("GET", f"/orders/buyer/{user_id}/")


class payment_id(APIView):
    def get(self, request, order_id):
        return proxy_request("GET", f"/orders/{order_id}/payment/")

    def post(self, request, order_id):
        return proxy_request("POST", f"/orders/{order_id}/payment/", request.data)

    def patch(self, request, order_id):
        return proxy_request("PATCH", f"/orders/{order_id}/payment/", request.data)

    def delete(self, request, order_id):
        return proxy_request("DELETE", f"/orders/{order_id}/payment/")


# USER API interfaces

class user_list(APIView):
    def get(self, request):
        return proxy_request("GET", "/users/")


class user_id(APIView):
    def get(self, request, user_id):
        if is_admin(request):
            return proxy_request("GET", f"/auth/profile/{user_id}/")
        return proxy_request("GET", f"/users/{user_id}/")


# Public API

class public_user_list(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return proxy_request("GET", "/public/users/")


class public_user_id(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        return proxy_request("GET", f"/public/users/{user_id}/")


class public_listing_id(APIView):
    permission_classes = [AllowAny]

    def get(self, request, user_id):
        return proxy_request("GET", f"/public/listings/{user_id}/")


class public_listing_full(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return proxy_request("GET", "/public/listings/")

# ADMIN API

# return list of banned users
class admin_bans(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        return proxy_request("GET", f"/admin/bans/")


# /admin/bans/{user_id}
class manage_bans(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    # adding to ban list
    def post(self, request, user_id):
        return proxy_request("POST", f"/admin/bans/{user_id}/")

    # unban funcionality
    def delete(self, request, id):
        return proxy_request("DELETE", f"/admin/bans/{user_id}/")

class manage_admins(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, user_id):
        return proxy_request("POST", f"/admin/manage/{user_id}/")

    def delete(self, request, user_id):
        return proxy_request("DELETE", f"/admin/manage/{user_id}/")

class list_admins(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        return proxy_request("GET", f"/admin/manage/")

class admin_dashboard(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        return proxy_request("GET", f"/admin/dashboard/")

# graphana
