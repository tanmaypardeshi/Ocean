import os
import pickle
from django.shortcuts import render
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from user.models import User
from .models import Post, Tag, Like, Comment
from .serializers import CommentSerializer
from .summariser import create_summary

file = os.getcwd() + '/post/populate.txt'

with open(file, 'rb') as f:
    data = pickle.load(f)


def populate(request):
    if request.method == 'GET':
        return render(request, 'post/populate.html')
    else:
        for i in range(3):
            summary = create_summary(data['posts'][i])
            user = User.objects.get(email=data['email'][i])
            post = Post.objects.create(user=user,
                                       title=data['title'][i],
                                       description=data['posts'][i],
                                       summary=summary)
            post.save()
            query_list = data['tags'][i]
            for query in query_list:
                print(query)
                tag = Tag.objects.get(tag_name=query)
                post.post_tag.add(tag)
            post.save()
        return render(request, 'post/success.html')


class PostView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request):
        try:
            posts = Post.objects.all().order_by('published_at').reverse()
            post_list = get_posts(posts, request)
            return Response({
                'success': True,
                'message': f'Fetched {len(post_list)} posts',
                'post_list': post_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        try:
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
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Could not post data. {e.__str__()}'
            }, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, *args, **kwargs):
        id = int(request.data['id'])
        try:
            post = Post.objects.get(id=id)
            if post.user == request.user:
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
                    'message': 'Edit post successfully'
                }, status=status.HTTP_200_OK)
            return Response({
                'success': False,
                'message': "Cannot edit someone else's post"
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Post.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Could not edit post'
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

    def delete(self, request, id):
        try:
            post = Post.objects.get(id=id)
            if post.user == request.user:
                post.delete()
                return Response({
                    'success': True,
                    'message': 'Deleted post successfully'
                }, status=status.HTTP_200_OK)
            return Response({
                'success': False,
                'message': "Cannot delete someone else's post"
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Post.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Could not delete post'
            }, status=status.HTTP_400_BAD_REQUEST)


class CategoryView(generics.ListAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get_queryset(self):
        tag = Tag.objects.get(tag_name=self.kwargs['tag'])
        posts = Post.objects.filter(post_tag=tag).order_by('published_at').reverse()
        return posts

    def get(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            post_list = get_posts(queryset, request)
            return Response({
                'success': True,
                'post_list':post_list}
            ,status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


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
                'message': 'Already unliked this post'
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
            comment = Comment.objects.get(id=kwargs['id'], user=request.user)
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


class MyPosts(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get(self, request, *args, **kwargs):
        try:
            posts = Post.objects.filter(user=request.user)
            post_list = get_posts(posts, request)
            return Response({
                'success': True,
                'post_list': post_list,
                'post count': len(post_list)
            })
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class MyLikes(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get(self, request, *args, **kwargs):
        try:
            likes = Like.objects.filter(user=request.user)
            objects = {}
            like_list = []
            for like in likes:
                objects['post_id'] = like.post.pk
                objects['post_title'] = like.post.title
                objects['author'] = f"{like.post.user.first_name} {like.post.user.last_name}"
                like_list.append(objects)
                objects = {}
            return Response({
                'success': True,
                'message': 'Fetched Likes Successfully',
                'like_list': like_list,
                'like count': len(like_list)
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class MyComments(generics.ListAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get(self, request, *args, **kwargs):
        try:
            comments = Comment.objects.filter(user=request.user)
            objects = {}
            comment_list = []
            for comment in comments:
                objects['post_id'] = comment.post.pk
                objects['post_title'] = comment.post.title
                objects['author'] = f"{comment.post.user.first_name} {comment.post.user.last_name}"
                objects['comment_id'] = comment.pk
                objects['content'] = comment.content
                objects['published_at'] = comment.published_at
                comment_list.append(objects)
                objects = {}
            return Response({
                'success': True,
                'message': 'Fetched Comments Successfully',
                'comment_list': comment_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


def get_posts(posts, request):
    post_list = []
    objects = {}
    for post in posts:
        tag_list = []
        tags = Tag.objects.filter(post=post)
        for tag in tags:
            tag_list.append(tag.tag_name)
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
        objects['tags'] = tag_list
        post_list.append(objects)
        objects = {}
    return post_list
