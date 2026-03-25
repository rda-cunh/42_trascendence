from rest_framework import serializers


class userId(serializers.serializer):
    user_id = serializers.IntegerField(required=True)

class userCreate(serializers.serializer):
    username = serializers.CharField(min_length=3, max_length=255, trim_whitespace=True)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)
    phone = serializers.CharField(required=False,min_length=9, max_length=13)
    avatar_url = serializers.URLField(required=False)

class userDelete(serializers.serializer):
    user_id = serializers.IntegerField()
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)

class userLogin(serializers.serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)

class userLogout(serializers.serializer):
    user_id = serializers.IntegerField(required=True)

class userPatch(serializers.serializer):
    username = serializers.CharField(allow_null=True, min_length=3, max_length=255, trim_whitespace=True)
    email = serializers.EmailField(allow_null=True)
    phone = serializers.CharField(allow_null=True, min_length=9, max_length=13)
    avatar_url = serializers.URLField(allow_null=True, required=False)

class userPassPatch(serializers.serializer):
    user_id = serializers.IntegerField(required=True)
    password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)
    new_password = serializers.CharField(min_length=8, max_length=64, trim_whitespace=True)


