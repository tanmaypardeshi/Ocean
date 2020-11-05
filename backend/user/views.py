import random
import datetime
from django.core.mail import send_mail
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework_jwt.settings import api_settings

from .permissions import IsAdmin, IsStaff
from .models import (User, Tag, OTP, )
from .serializers import (RegisterSerializer, LoginSerializer, EditSerializer,
                          ForgotSerializer, ChangeSerializer, ModeratorSerializer, )

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


class UserView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        tag = request.data['tags']
        user_serializer = RegisterSerializer(data=request.data)
        if user_serializer.is_valid():
            user_serializer.save()
            user = User.objects.get(email=user_serializer.data.get('email'))
            if tag != '':
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
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)
            response = {
                'success': True,
                'message': 'User registered successfully',
                'token': token
            }

            return Response(response, status=status.HTTP_201_CREATED)
        response = {
            'success': False,
            'message': 'User Already Registered!',
        }
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)


class CreateModeratorView(APIView):
    permission_classes = (IsAdmin, IsStaff,)

    def post(self, request):
        tag = request.data['tags']
        user_serializer = RegisterSerializer(data=request.data)
        if user_serializer.is_valid():
            user_serializer.save()
            user = User.objects.get(email=user_serializer.data.get('email'))
            user.is_moderator = True
            if tag != '':
                tag_list = tag.split(' ')
                query_list = []
                for tag_name in tag_list:
                    query_list.append(Tag.objects.get(tag_name=tag_name))
                for queryset in query_list:
                    user.user_tag.add(queryset)
            user.save()
            response = {
                'success': True,
                'message': 'Moderator registered successfully',
            }

            return Response(response, status=status.HTTP_201_CREATED)
        response = {
            'success': False,
            'message': 'Already a moderator',
        }
        return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetModerators(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)
    serializer_class = ModeratorSerializer

    def get_queryset(self):
        tag_name = self.kwargs['tag']
        tag = Tag.objects.get(tag_name=tag_name)
        user = User.objects.filter(user_tag=tag, is_moderator=True)
        return user

    def get(self, request, *args, **kwargs):
        try:
            query_set = self.get_queryset()
            serializer = self.serializer_class(query_set, many=True)
            return Response({
                'status': True,
                'message': f'Fetched {len(serializer.data)} moderators',
                'moderators': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = (AllowAny,)
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            response = {
                'success': True,
                'message': 'User logged in successfully',
                'token': serializer.data['token'],
            }
            return Response(response, status=status.HTTP_200_OK)
        response = {
            'success': False,
            'message': 'Invalid Credentials',
        }
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request):
        try:
            user = User.objects.get(email=request.user)
            last_login = user.last_login + datetime.timedelta(hours=5.5)
            date_joined = user.date_joined + datetime.timedelta(hours=5.5)
            status_code = status.HTTP_200_OK
            response = {
                'success': True,
                'status_code': status.HTTP_200_OK,
                'message': 'Profile fetched',
                'data': {
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'dob': user.dob,
                    'age': (datetime.date.today() - user.dob).days // 365,
                    'gender': user.gender,
                    'country': user.country,
                    'last_login': last_login,
                    'date_joined': date_joined,
                    'is_moderator': user.is_moderator,
                    'tags': list(user.user_tag.all().values_list('tag_name', flat=True))
                }
            }
        except Exception as e:
            status_code = status.HTTP_400_BAD_REQUEST
            response = {
                'success': False,
                'status code': status.HTTP_400_BAD_REQUEST,
                'message': 'User does not exists',
                'error': str(e)
            }
        return Response(response, status=status_code)

    def patch(self, request):
        serializer = EditSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            serializer.update(User.objects.get(email=request.user), request.data)
            response = {
                'success': True,
                'status code': status.HTTP_200_OK,
            }
            status_code = status.HTTP_200_OK

            return Response(response, status=status_code)
        response = {
            'success': False,
            'status code': status.HTTP_401_UNAUTHORIZED,
        }
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)


class OTPView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        try:
            user = User.objects.get(email=request.data['email'])
            try:
                otp = OTP.objects.get(user=user)
                otp.otp = random.randint(1000, 9999)
                otp.counter = otp.counter + 1
            except OTP.DoesNotExist:
                otp = OTP()
                otp.user = user
                otp.otp = random.randint(1000, 9999)
                otp.counter = otp.counter + 1
            otp.save()
            try:
                send_mail(
                    'OTP for Forgotten Password',
                    f"Dear {user.first_name} {user.last_name},\nFollowing are the details for your forgotten password registered under {user.email}.\n\nOTP : {otp.otp}\nThank you",
                    'credenzuser@gmail.com',
                    [f"{user.email}"],
                    fail_silently=False
                )
            except:
                response = {
                    'success': False,
                    'message': 'Could not send email. Please try again later',
                }
                return Response(response, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            response = {
                'success': True,
                'message': 'OTP sent to email successfully',
            }
            return Response(response, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            response = {
                'success': False,
                'message': 'Email does not exist',
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)


class VerifyOtp(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data['email']
        otp = int(request.data['otp'])
        try:
            user = User.objects.get(email=email)
            try:
                otp_obj = OTP.objects.get(user=user)
                if otp == otp_obj.otp and user == otp_obj.user:
                    user.is_otp_verified = True
                    user.save()
                    response = {
                        'success': True,
                        'message': 'OTP verified'
                    }
                    return Response(response, status=status.HTTP_200_OK)
                else:
                    response = {
                        'success': False,
                        'message': 'OTP could not be verified'
                    }
                    return Response(response, status=status.HTTP_400_BAD_REQUEST)
            except OTP.DoesNotExist:
                response = {
                    'success': False,
                    'message': 'Please generate an OTP on registered email'
                }
                return Response(response, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            response = {
                'success': False,
                'message': 'Could not find user'
            }
            return Response(response, status=status.HTTP_401_UNAUTHORIZED)


class ForgotPassword(APIView):
    permission_classes = (AllowAny,)
    serializer_class = ForgotSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            response = {
                'success': True,
                'message': 'Changed password'
            }
            return Response(response, status=status.HTTP_200_OK)
        response = {
            'success': True,
            'message': 'Please verify OTP first'
        }
        return Response(response, status=status.HTTP_400_BAD_REQUEST)


class ChangePassword(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            serializer = ChangeSerializer(User.objects.get(email=request.user), request.data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            response = {
                'success': True,
                'message': 'Password updated successfully',
            }
            return Response(response, status=status.HTTP_200_OK)
        except Exception as e:
            response = {
                'success': False,
                'message': e.__str__()
            }
            return Response(response, status=status.HTTP_400_BAD_REQUEST)
