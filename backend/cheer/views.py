from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .models import Task, SubTask, Taken


class TaskView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request, *args, **kwargs):
        try:
            tasks = Task.objects.all()
            tasks_list = get_tasks(tasks, request)
            return Response({
                'success': True,
                'message': f'Fetched {len(tasks_list)} posts',
                'post_list': tasks_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class UserTaskView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def get(self, request, *args, **kwargs):
        try:
            tasks = Task.objects.filter(user=request.user)
            tasks_list = get_tasks(tasks, request)
            return Response({
                'success': True,
                'message': f'Fetched {len(tasks_list)} posts',
                'post_list': tasks_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class SingleTaskView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request, *args, **kwargs):
        try:
            task = Task.objects.filter(id=kwargs['id'])
            task_list = get_tasks(task, request)
            return Response({
                'success': True,
                'message': f"Fetched task id {kwargs['id']} successfully",
                'task': task_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


def get_tasks(tasks, request):
    tasks_list = []
    objects = {}
    if tasks == 1:
        try:
            Taken.objects.get(task=tasks, user=request.user)
            is_taken = True
        except Taken.DoesNotExist:
            is_taken = False
        objects['id'] = tasks.id
        objects['first_name'] = tasks.user.first_name
        objects['last_name'] = tasks.user.last_name
        objects['task'] = tasks.task
        objects['is_taken'] = is_taken
        return objects

    else:
        for task in tasks:
            try:
                Taken.objects.get(task=task, user=request.user)
                is_taken = True
            except Taken.DoesNotExist:
                is_taken = False
            objects['id'] = task.id
            objects['first_name'] = task.user.first_name
            objects['last_name'] = task.user.last_name
            objects['task'] = task.task
            objects['is_taken'] = is_taken
            tasks_list.append(objects)
            objects = {}
        return tasks_list


