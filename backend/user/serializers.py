from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_jwt.settings import api_settings
from .models import User, Tag

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name',
                  'age', 'dob', 'gender', 'city', 'state', 'country']

    def create(self, validated_data):
        user = User.objects.create_user(email=validated_data['email'],
                                        password=validated_data['password'])
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.age = validated_data['age']
        user.dob = validated_data['dob']
        user.gender = validated_data['gender']
        user.city = validated_data['city']
        user.state = validated_data['state']
        user.country = validated_data['country']
        user.save()
        return user


class TagSerializer(ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Tag
        fields = '__all__'

    def create(self, validated_data):
        user = UserSerializer.create(UserSerializer(), validated_data=validated_data.pop('user'))
        tag = Tag(**validated_data)
        tag.user = user
        tag.save()
        return tag


class LoginSerializer(Serializer):
    email = serializers.EmailField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        email = data.get("email", None)
        password = data.get("password", None)
        user = authenticate(email=email, password=password)
        if user is None:
            raise serializers.ValidationError(
                'Invalid Credentials'
            )
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        update_last_login(None, user)
        return {
            'email': user.email,
            'token': token
        }
