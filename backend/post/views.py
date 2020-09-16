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

    def get(self, request):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        tag = str(request.data['tag'])
        tag_list = tag.split(' ')
        queryset_list = []
        for tag_name in tag_list:
            tag = Tag.objects.get(tag_name=tag_name)
            queryset_list.append(tag)
        post = Post.objects.create(user=request.user,
                                   title=request.data['title'],
                                   description=request.data['description'],
                                   )
        post.save()
        for queryset in queryset_list:
            post.post_tag.add(queryset)
        post.save()
        return Response({
            'success': True,
            'message': 'Saved post successfully'
        }, status=status.HTTP_200_OK)

    def patch(self, request, *args, **kwargs):
        id = int(request.data['id'])
        try:
            post = Post.objects.get(id=id)
            post.post_tag.clear()
            new_title = request.data['title']
            new_description = request.data['description']
            tag = str(request.data['tag'])
            tag_list = tag.split(' ')
            queryset_list = []
            for tag_name in tag_list:
                tag = Tag.objects.get(tag_name=tag_name)
                queryset_list.append(tag)
            post.title = new_title
            post.description = new_description
            post.save()
            for queryset in queryset_list:
                post.post_tag.add(queryset)
            post.save()
            return Response({
                'success': True,
                'message': 'Saved post successfully'
            }, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Could not edit post'
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        id = int(request.data['id'])
        try:
            post = Post.objects.get(id=id)
            post.delete()
            return Response({
                'success': True,
                'message': 'Deleted post'
            }, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Could not delete post'
            }, status=status.HTTP_400_BAD_REQUEST)


class CategoryView(ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)
    serializer_class = PostSerializer

    def get_queryset(self):
        tag = Tag.objects.get(tag_name=self.kwargs['tag'])
        posts = Post.objects.filter(post_tag=tag)
        return posts

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
