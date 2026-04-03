from rest_framework import serializers


# /api/auth/register

class authentication(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)

class idVerifier(serializers.Serializer):
   user_id = serializers.IntegerField(required=True)


class authCreate(authentication):
    name = serializers.CharField(min_length=3, max_length=255, trim_whitespace=True)
    phone = serializers.CharField(required=False,min_length=9, max_length=13)
    status = serializers.CharField(required=False)
    avatar_url = serializers.URLField(required=False)


class authDelete(authentication):
    pass

# /api/auth/login


class authLogin(authentication):
    pass


# /api/auth/profile


class authPatch(serializers.Serializer):
    name = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    email = serializers.EmailField(allow_null=True)
    phone = serializers.CharField(allow_null=True, min_length=9, max_length=13)
    avatar_url = serializers.URLField(allow_null=True, required=False)


class authProfileDelete(serializers.Serializer):
    name = serializers.CharField(allow_null=True, required=False)
    email = serializers.EmailField(allow_null=True, required=False)
    phone = serializers.CharField(allow_null=True, required=False)
    avatar_url = serializers.URLField(allow_null=True, required=False)

# /api/auth/profile/password


class authPassPatch(serializers.Serializer):
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)
    new_password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)


# /api/auth/address

class authAdressPost(serializers.Serializer):
    


# /api/listings/{id}


class listingsIdPatch(idVerifier):
    product_name = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    slug = serializers.SlugField(allow_null=True, required=False)
    description = serializers.CharField(allow_null=True, min_length=3, required=False)


# /api/listings

class listingsPost(serializers.Serializer):
    product_name = serializers.CharField(min_length=3, max_length=255, trim_whitespace=True)
    slug = serializers.SlugField(required=False)
    description = serializers.CharField(min_length=3, required=False)


# /api/users/{id}


