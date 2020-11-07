from django.urls import path

from .views import (GetTaskView, PostTaskView, UserTaskView, SingleTaskView,
                    TakeTaskView, UpdateProgressView)

urlpatterns = [
    path('follow/', TakeTaskView.as_view(), name='follow'),
    path('posttask/', PostTaskView.as_view(), name='post-tasks'),
    path('mytasks/', UserTaskView.as_view(), name='user-tasks'),
    path('update/', UpdateProgressView.as_view(), name='update'),
    path('<int:id>/', SingleTaskView.as_view(), name='single-task'),
    path('gettasks/<int:id>/', GetTaskView.as_view(), name='get-tasks'),
    
    
]
