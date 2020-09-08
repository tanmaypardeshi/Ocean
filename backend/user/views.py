from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework_jwt.settings import api_settings

from .models import User
from .serializers import TagSerializer, LoginSerializer

jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER


class UserView(APIView):
    permission_classes = (AllowAny,)
    def post(self, request):
        tag_serializer = TagSerializer(data=request.data)
        if tag_serializer.is_valid():
            tag_serializer.save()
            user = User.objects.get(email=tag_serializer.data.pop('user')['email'])
            payload = jwt_payload_handler(user)
            token = jwt_encode_handler(payload)

            response = {
                'success': 'True',
                'message': 'User registered successfully',
                'token': token
            }

            return Response(response, status=status.HTTP_201_CREATED)
        response = {
            'success': 'False',
            'message': 'User Already Registered!',
        }
        return Response(response, status=status.HTTP_401_UNAUTHORIZED)


class LoginView(APIView):
    permission_classes = (AllowAny, )
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            print(serializer.data)
            response = {
                'success': 'True',
                'message': 'User logged in successfully',
                'token': serializer.data['token'],
            }

            return Response(response, status=status.HTTP_200_OK)
        response = {
            'success': 'False',
            'message': 'Invalid Credentials',
        }

        return Response(response, status=status.HTTP_401_UNAUTHORIZED)