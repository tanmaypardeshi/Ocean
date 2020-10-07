from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # user
    path('api/user/', include('user.urls')),

    # post
    path('api/post/', include('post.urls')),

    # admin
    path('admin/', admin.site.urls),
]
