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
                  'dob', 'gender', 'city', 'state', 'country']

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


class EditSerializer(serializers.Serializer):

    def update(self, instance, data):
        user = instance
        tag = Tag.objects.get(user=user)
        if user is None:
            raise serializers.ValidationError(
                'A user with this email and password is not found.'
            )

        user.first_name = data['first_name']
        user.last_name = data['last_name']
        user.dob = data['dob']
        user.gender = data['gender']
        user.city = data['city']
        user.state = data['state']
        user.country = data['country']
        tag.productivity = data['productivity']
        tag.self_help = data['self_help']
        tag.self_improvement = data['self_improvement']
        tag.personal_development = data['personal_development']
        tag.spirituality = data['spirituality']
        tag.motivation = data['motivation']
        tag.positivity = data['positivity']
        tag.career = data['career']
        tag.discipline = data['discipline']
        tag.relationships = data['relationships']
        tag.success = data['success']
        tag.depression = data['depression']
        tag.anxiety = data['anxiety']
        tag.ptsd = data['ptsd']
        tag.alcohol = data['alcohol']
        tag.internet_addiction = data['internet_addiction']
        tag.bipolar_disorder = data['bipolar_disorder']
        tag.social_anxiety_disorder = data['social_anxiety_disorder']
        tag.stress = data['stress']
        tag.sleep_disorder = data['sleep_disorder']
        tag.empathy_deficit_disorder = data['empathy_deficit_disorder']
        tag.save()
        user.save()
        return user


class ChangeSerializer(serializers.Serializer):
    password = serializers.CharField(max_length=128)
    new_password = serializers.CharField(max_length=128)

    def update(self, instance, data):
        user = instance
        password = data['password']
        new_password = data['new_password']

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
