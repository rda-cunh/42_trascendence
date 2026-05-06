from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


# -- AUTH SERIALIZERS --

class RegisterSerializer(serializers.Serializer):
    """POST /api/auth/register/ — validate input before sending to data-service"""
    name = serializers.CharField(min_length=3, max_length=150)  
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)
    phone = serializers.CharField(allow_null=True, allow_blank=True, required=False, max_length=13)
    avatar_url = serializers.URLField(allow_null=True, allow_blank=True, required=False)

class LoginSerializer(serializers.Serializer):
    """POST /api/auth/login/ — validate credentials before proxying"""
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, write_only=True)

class ProfilePatchSerializer(serializers.Serializer):
    """PATCH /api/auth/profile/ — partial update fields"""
    name = serializers.CharField(allow_null=True, allow_blank=True, required=False, max_length=150) 
    phone = serializers.CharField(allow_null=True, allow_blank=True, required=False, max_length=13)
    avatar_url = serializers.URLField(allow_null=True, allow_blank=True, required=False)

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


# -- LISTINGS SERIALIZERS --

# /api/listings/{id}

class listinsIdPatch(serializers.Serializer):
    product_name = serializers.CharField(allow_blank=True, min_length=3, max_length=255, trim_whitespace=True)
    slug = serializers.SlugField(allow_null=True, allow_blank=True, required=False)
    description = serializers.CharField(allow_null=True, allow_blank=True, required=False, min_length=3)


# /api/listings


# /api/users/{id}

