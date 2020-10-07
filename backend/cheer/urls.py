from django.urls import path

from .views import (TaskView, UserTaskView, SingleTaskView, )

urlpatterns = [
    path('gettasks/', TaskView.as_view(), name='get-tasks'),
    path('mytasks/', UserTaskView.as_view(), name='user-tasks'),
    path('<int:id>/', SingleTaskView.as_view(), name='single-task'),
]
