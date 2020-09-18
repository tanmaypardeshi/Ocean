from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .models import Post, Tag, Like, Comment
from .serializers import CommentSerializer


class PostView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request):
        posts = Post.objects.all().order_by('published_at').reverse()
        post_list = get_posts(posts, request)
        return Response(post_list, status=status.HTTP_200_OK)

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


class SinglePostView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get(self, request, id):
        post = Post.objects.get(id=id)
        objects = {}
        try:
            Like.objects.get(post=post, user=request.user)
            is_liked = True
        except Like.DoesNotExist:
            is_liked = False
        objects['id'] = post.id
        objects['first_name'] = post.user.first_name
        objects['last_name'] = post.user.last_name
        objects['title'] = post.title
        objects['description'] = post.description
        objects['published_at'] = post.published_at
        objects['is_liked'] = is_liked
        return Response(objects, status=status.HTTP_200_OK)


class CategoryView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get_queryset(self):
        tag = Tag.objects.get(tag_name=self.kwargs['tag'])
        posts = Post.objects.filter(post_tag=tag).order_by('published_at').reverse()
        return posts

    def get(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        post_list = get_posts(queryset, request)
        return Response(post_list, status=status.HTTP_200_OK)


class LikeView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = request.data['id']
        try:
            post = Post.objects.get(id=post_id)
            post.save()
            like, created = Like.objects.get_or_create(user=user, post=post)
            if not created:
                return Response({
                    'success': False,
                    'message': 'Already liked the post before'
                }, status=status.HTTP_200_OK)
            else:
                like.save()
                return Response({
                    'success': True,
                    'message': 'Liked post'
                }, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Could not like post'
            }, status=status.HTTP_400_BAD_REQUEST)

class UnlikeView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def post(self, request, *args, **kwargs):
        user = request.user
        post_id = request.data['id']
        try:
            post = Post.objects.get(id=post_id)
            post.save()
            like = Like.objects.get(post=post, user=user)
            like.delete()
            return Response({
                'success':True,
                'message': 'Unliked post'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
                'message': 'Could not unlike post'
            }, status=status.HTTP_400_BAD_REQUEST)


class CommentView(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )
    serializer_class = CommentSerializer

    def get(self, request, *args, **kwargs):
        queryset = Comment.objects.filter(parent__isnull=True, post=int(self.kwargs['id']))
        serializer = self.serializer_class(queryset, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        try:
            post_id = self.kwargs['id']
            post = Post.objects.get(id=post_id)
            user = request.user
            parent_id = request.data['parent_id']
            content = request.data['content']
            comment = Comment.objects.create(
                post=post,
                user=user,
                parent_id=parent_id,
                content=content
            )
            comment.save()
            return Response({
                'success': True,
                'message': 'Added comment'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
                'message': 'Could not add comment'
            }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        try:
            id = request.data['id']
            new_content = request.data['content']
            comment = Comment.objects.get(id=id, user=request.user)
            comment.content = new_content
            comment.save()
            return Response({
                'success': True,
                'message': 'Edited comment'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
                'message': 'Could not edit comment'
            }, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        try:
            id = request.data['id']
            comment = Comment.objects.get(id=id, user=request.user)
            comment.delete()
            return Response({
                'success': True,
                'message': 'Deleted comment'
            }, status=status.HTTP_200_OK)
        except:
            return Response({
                'success': False,
                'message': 'Could not delete comment'
            }, status=status.HTTP_400_BAD_REQUEST)


def get_posts(posts, request):
    post_list = []
    objects = {}
    for post in posts:
        try:
            Like.objects.get(post=post, user=request.user)
            is_liked = True
        except Like.DoesNotExist:
            is_liked = False
        objects['id'] = post.id
        objects['first_name'] = post.user.first_name
        objects['last_name'] = post.user.last_name
        objects['title'] = post.title
        objects['description'] = post.description
        objects['published_at'] = post.published_at
        objects['is_liked'] = is_liked
        post_list.append(objects)
        objects = {}
    return post_list
