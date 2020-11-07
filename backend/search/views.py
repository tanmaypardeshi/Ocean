import pandas as pd
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.permissions import IsAuthenticated

from .search import search
from user.models import User, Tag
from post.models import Like, Post, Comment


class SearchView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated, ]
    authentication_classes = [JSONWebTokenAuthentication, ]

    def get(self, request, *args, **kwargs):
        query = request.data['query']
        post_set = set()
        try:
            user = User.objects.get(email=request.user)
            tags = user.user_tag.all()
            for tag in tags:
                posts = Post.objects.filter(post_tag=tag.id)
                for post in posts:
                    post_set.add(post.id)
            likes = Like.objects.filter(user=request.user)
            for like in likes:
                post_set.add(like.post_id)
            comments = Comment.objects.filter(user=request.user)
            for comment in comments:
                post_set.add(comment.post_id)
            post_set = list(post_set)
            df = pd.DataFrame(columns=['id', 'title'])
            for p in post_set:
                post = Post.objects.get(id=p)
                df = df.append({'id': post.id, 'title': post.title}, ignore_index=True)
            result = search(df, query)
            search_results = serialize(result)
            return Response({
                'status': True,
                'message': 'Success',
                'search_results': search_results
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'status': False,
                'message': e.__str__()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def serialize(result):
    objects = {}
    search_results = []
    for i in range(result.shape[0]):
        objects['id'] = result['id'][i]
        objects['title'] = result['title'][i]
        search_results.append(objects)
        objects = {}
    return search_results
