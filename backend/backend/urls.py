from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    
    # search
    path('api/search/', include('search_data.urls')),
    
     # user
    path('api/user/', include('user.urls')),

    # post
    path('api/post/', include('post.urls')),

    # cheer
    path('api/cheer/', include('cheer.urls')),

    # chat
    path('api/coral/', include('coral.urls')),

    # admin
    path('admin/', admin.site.urls),
]
