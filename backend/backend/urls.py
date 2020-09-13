from django.contrib import admin
from django.urls import path

from user.views import (UserView, LoginView, ProfileView,
                        OTPView, VerifyOtp, ForgotPassword,
                        ChangePassword, )
from post.views import (PostView, CategoryView, )

urlpatterns = [
    # user
    path('api/user/register/', UserView.as_view(), name='register'),
    path('api/user/login/', LoginView.as_view(), name='login'),
    path('api/user/profile/', ProfileView.as_view(), name='view'),
    path('api/user/otp/', OTPView.as_view(), name='otp'),
    path('api/user/verify/', VerifyOtp.as_view(), name='verify'),
    path('api/user/forgot/', ForgotPassword.as_view(), name='forgot'),
    path('api/user/change/', ChangePassword.as_view(), name='change'),

    # post
    path('api/post/wall/', PostView.as_view(), name='wall'),
    path('api/post/<tag>/', CategoryView.as_view(), name='category'),

    # admin
    path('admin/', admin.site.urls),
]
