from django.urls import path

from .views import (PostView, CategoryView, LikeView,
                    CommentView, UnlikeView, SinglePostView,
                    MyPosts, MyLikes, MyComments, )

urlpatterns = [
    path('wall/', PostView.as_view(), name='wall'),
    path('<int:id>/', SinglePostView.as_view(), name='one-post'),
    path('like/', LikeView.as_view(), name='like'),
    path('unlike/', UnlikeView.as_view(), name='unlike'),
    path('comment/<int:id>/', CommentView.as_view(), name='comment'),
    path('<str:tag>/', CategoryView.as_view(), name='category'),
    path('myposts/', MyPosts.as_view(), name='my-posts'),
    path('mylikes/', MyLikes.as_view(), name='my-likes'),
    path('mycomments/', MyComments.as_view(), name='my-comments')
]
