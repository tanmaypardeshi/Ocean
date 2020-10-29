from django.urls import path

from .views import (PostView, CategoryView, LikeView,
                    CommentView, UnlikeView, SinglePostView,
                    MyPosts, MyLikes, MyComments, NewEditPostView,
                    DeletePost, )

urlpatterns = [
    # path('populate/', populate, name='populate'),
    path('wall/', NewEditPostView.as_view(), name='post-edit'),
    path('like/', LikeView.as_view(), name='like'),
    path('unlike/', UnlikeView.as_view(), name='unlike'),
    path('moderate/', DeletePost.as_view(), name='delete-moderator'),
    path('myposts/<int:id>/', MyPosts.as_view(), name='my-posts'),
    path('mylikes/<int:id>/', MyLikes.as_view(), name='my-likes'),
    path('mycomments/<int:id>/', MyComments.as_view(), name='my-comments'),
    path('wall/<int:id>/', PostView.as_view(), name='wall'),
    path('<int:id>/', SinglePostView.as_view(), name='one-post'),
    path('comment/<int:id>/', CommentView.as_view(), name='comment'),
    path('<str:tag>/<int:id>/', CategoryView.as_view(), name='category'),
]
