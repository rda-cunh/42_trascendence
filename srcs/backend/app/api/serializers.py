from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

# -- AUTH SERIALIZERS --

class RegisterSerializer(serializers.Serializer):
    """POST /api/auth/register/ — validate input before sending to data-service"""
    name = serializers.CharField(min_length=3, max_length=150)  
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)
    phone = serializers.CharField(max_length=13, required=False, allow_null=True)
    avatar_url = serializers.URLField(required=False, allow_null=True)

class LoginSerializer(serializers.Serializer):
    """POST /api/auth/login/ — validate credentials before proxying"""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)

class ProfilePatchSerializer(serializers.Serializer):
    """PATCH /api/auth/profile/ — partial update fields"""
    name = serializers.CharField(max_length=150, required=False, allow_null=True)
    phone = serializers.CharField(max_length=13, required=False, allow_null=True)
    avatar_url = serializers.URLField(required=False, allow_null=True)
from rest_framework import serializers
class ChangePasswordSerializer(serializers.Serializer):
    """PATCH /api/auth/password/"""
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)
    new_password = serializers.CharField(min_length=8, max_length=64, write_only=True)

    def validate(self, attrs):
        if attrs['password'] == attrs['new_password']:
            raise serializers.ValidationError("New password must differ from current.")
        return attrs

class DeleteAccountSerializer(serializers.Serializer):
    """DELETE /api/auth/profile/ — password confirmation"""
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)

# -- JWT SERIALIZERS --

class CustomTokenPairSerializer(TokenObtainPairSerializer):
    """Customizes login response — accepts email instead of username, adds user data to token payload"""
    email = serializers.EmailField()
    username = serializers.CharField(required=False)  # Make username optional to avoid parent class errors
    
    def validate(self, attrs):
        # remove the username field requirement since we're using email
        if 'username' not in attrs:
            attrs['username'] = attrs.get('email')  # Use email as username internally
        return super().validate(attrs)
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # include role/name in token (data-service response provides this)
        token['name'] = user.get('name')
        token['role'] = user.get('role')
        return token

# -- CHAT SERIALIZERS --

class ChatConversationCreateSerializer(serializers.Serializer):
    """POST /api/chat/conversations/ — create a new conversation"""
    listing_id = serializers.IntegerField(min_value=1)

# -- LISTINGS SERIALIZERS --

# /api/listings/{id}

class listinsIdPatch(serializers.Serializer):
    product_name = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    slug = serializers.SlugField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, min_length=3, required=False)


# /api/listings


# /api/users/{id}

