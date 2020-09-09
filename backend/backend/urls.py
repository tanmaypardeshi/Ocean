from django.contrib import admin
from django.urls import path

from user.views import UserView, LoginView, ProfileView, OTPView, VerifyOtp, ForgotPassword, ChangePassword

urlpatterns = [
    path('api/register/', UserView.as_view(), name='register'),
    path('api/login/', LoginView.as_view(), name='login'),
    path('api/profile/', ProfileView.as_view(), name='view'),
    path('api/otp/', OTPView.as_view(), name='otp'),
    path('api/verify/', VerifyOtp.as_view(), name='verify'),
    path('api/forgot/', ForgotPassword.as_view(), name='forgot'),
    path('api/change/', ChangePassword.as_view(), name='change'),
    path('admin/', admin.site.urls),
]
