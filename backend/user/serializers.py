from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, Serializer
from rest_framework_jwt.settings import api_settings
from .models import User, Tag

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


class RegisterSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name',
                  'dob', 'gender', 'country']

    def create(self, validated_data):
        user = User.objects.create_user(email=validated_data['email'],
                                        password=validated_data['password'])
        user.first_name = validated_data['first_name']
        user.last_name = validated_data['last_name']
        user.dob = validated_data['dob']
        user.gender = validated_data['gender']
        user.country = validated_data['country']
        user.save()
        return user


class ModeratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name']


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


class EditSerializer(serializers.Serializer):
    def update(self, instance, data):
        user = instance
        if user is None:
            raise serializers.ValidationError(
                'A user with this email and password is not found.'
            )
        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.dob = data['dob']
        user.gender = data['gender']
        user.country = data['country']
        user.user_tag.clear()
        if data['tags'] != '':
            tag = data['tags']
            tag_list = tag.split(' ')
            query_list = []
            for tag_name in tag_list:
                try:
                    query_list.append(Tag.objects.get(tag_name=tag_name))
                except Tag.DoesNotExist:
                    pass
            for queryset in query_list:
                user.user_tag.add(queryset)
        user.save()
        return user


class ChangeSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=128)
    new_password = serializers.CharField(max_length=128)

    def update(self, instance, data):
        user = instance
        password = data['password']
        new_password = data['new_password']
        if password == new_password:
            raise serializers.ValidationError(
                'Old and New password cannot be the same'
            )

        user = authenticate(email=user, password=password)
        if user is None:
            raise serializers.ValidationError(
                'Invalid Credentials'
            )
        user.set_password(new_password)
        user.save()
        return {
            'email': user.email,
        }


class ForgotSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=255)
    new_password = serializers.CharField(max_length=128)

    def validate(self, data):
        email = data['email']
        new_password = data['new_password']

        user = User.objects.filter(email=email).first()

        if user is None:
            raise serializers.ValidationError(
                'Could not find user'
            )
        if not user.is_otp_verified:
            raise serializers.ValidationError(
                'Verify OTP first'
            )
        user.set_password(new_password)
        user.is_otp_verified = False
        user.save()
        return {
            'email': user.email,
        }
