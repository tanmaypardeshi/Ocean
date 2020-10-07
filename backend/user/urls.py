from django.urls import path

from .views import (UserView, LoginView, ProfileView,
                    OTPView, VerifyOtp, ForgotPassword,
                    ChangePassword, )

urlpatterns = [
    path('register/', UserView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='view'),
    path('otp/', OTPView.as_view(), name='otp'),
    path('verify/', VerifyOtp.as_view(), name='verify'),
    path('forgot/', ForgotPassword.as_view(), name='forgot'),
    path('change/', ChangePassword.as_view(), name='change'),
]
