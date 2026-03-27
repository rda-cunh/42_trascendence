from rest_framework import serializers


# /api/auth/register

class authCreate(serializers.Serializer):
    username = serializers.CharField(min_length=3, max_length=255, trim_whitespace=True)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)
    phone = serializers.CharField(required=False,min_length=9, max_length=13)
    status = serializers.CharField(required=False)
    avatar_url = serializers.URLField(required=False)


class authDelete(serializers.Serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)

# /api/auth/login


class authLogin(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)


class authLogout(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)

# /api/auth/profile


class authPatch(serializers.Serializer):
    username = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    email = serializers.EmailField(allow_null=True)
    phone = serializers.CharField(allow_null=True, min_length=9, max_length=13)
    avatar_url = serializers.URLField(allow_null=True, required=False)

# /api/auth/profile/password


class authPassPatch(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)
    new_password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)


# /api/listings/{id}


class listinsIdPatch(serializers.Serializer):
    product_name = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    slug = serializers.SlugField(allow_null=True)
    description = serializers.CharField(allow_null=True, min_length=3, required=False)


# /api/listings


# /api/users/{id}


class userId(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)

