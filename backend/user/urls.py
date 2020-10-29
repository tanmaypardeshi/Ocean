from django.urls import path

from .views import (UserView, LoginView, ProfileView,
                    OTPView, VerifyOtp, ForgotPassword,
                    ChangePassword, CreateModeratorView,
                    GetModerators,)

urlpatterns = [
    path('register/', UserView.as_view(), name='register'),
    path('createmoderator/', CreateModeratorView.as_view(), name='create-mod'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='view'),
    path('otp/', OTPView.as_view(), name='otp'),
    path('verify/', VerifyOtp.as_view(), name='verify'),
    path('forgot/', ForgotPassword.as_view(), name='forgot'),
    path('change/', ChangePassword.as_view(), name='change'),
    path('getmoderators/<str:tag>/', GetModerators.as_view(), name='moderators'),
]
