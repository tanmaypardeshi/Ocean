from django.urls import path

from .views import (TaskView, UserTaskView, SingleTaskView,
                    TakeTaskView, DeleteTaskView, UpdateProgressView)

urlpatterns = [
    path('gettasks/', TaskView.as_view(), name='get-tasks'),
    path('mytasks/', UserTaskView.as_view(), name='user-tasks'),
    path('follow/<int:id>/', TakeTaskView.as_view(), name='follow'),
    path('unfollow/<int:id>/', DeleteTaskView.as_view(), name='unfollow'),
    path('update/', UpdateProgressView.as_view(), name='update'),
    path('<int:id>/', SingleTaskView.as_view(), name='single-task'),
]
