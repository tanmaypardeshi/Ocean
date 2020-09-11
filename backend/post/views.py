from rest_framework.generics import ListAPIView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .models import Post, Tag
from .serializers import PostSerializer


class PostView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)
    serializer_class = PostSerializer
    queryset = Post.objects.all().order_by('published_at').reverse()

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CategoryView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)
    serializer_class = PostSerializer

    def get_queryset(self):
        tag = Tag.objects.get(tag_name=self.kwargs['tag'])
        posts = Post.objects.filter(post_tag=tag)
        return posts

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
