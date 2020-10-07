from django.urls import path

from .views import TaskView

urlpatterns = [
    path('gettasks/', TaskView.as_view(), name='get-tasks'),
]