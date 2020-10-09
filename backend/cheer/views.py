from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .models import Task, SubTask


class TaskView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request, *args, **kwargs):
        try:
            tasks = Task.objects.all()
            task_list = get_tasks(tasks, request)
            return Response({
                'success': True,
                'message': f'Fetched {len(task_list)} tasks',
                'post_list': task_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            user = request.user
            subtasks = data.pop('subtasks')
            task = Task.objects.create(task=data['task'], created_by=f"{user.first_name} {user.last_name}")
            task.user.add(user)
            task.save()
            for subtask in subtasks:
                sub = SubTask(user=request.user, task=task, title=subtask['title'])
                sub.save()
            return Response({
                'success': True,
                'message': 'Added new task'
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
            task_list = get_tasks(tasks, request)
            return Response({
                'success': True,
                'message': f'Fetched {len(task_list)} tasks',
                'post_list': task_list
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
                'message': f"Fetched task ID {kwargs['id']} successfully",
                'task': task_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class TakeTaskView(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def post(self, request, *args, **kwargs):
        try:
            task = Task.objects.get(id=kwargs['id'])
            subtasks = SubTask.objects.filter(task=task)
            task.user.add(request.user)
            task.save()
            for subtask in subtasks:
                sub = SubTask(task=task, title=subtask.title, user=request.user)
                sub.save()
            return Response({
                'id': task.pk,
                'success': True,
                'message': 'Added task'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class DeleteTaskView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def delete(self, request, *args, **kwargs):
        try:
            task = Task.objects.get(id=kwargs['id'])
            task.user.remove(request.user)
            task.save()
            return Response({
                'success': True,
                'message': 'Deleted task'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class UpdateProgressView(APIView):
    permission_classes = (IsAuthenticated, )
    authentication_classes = (JSONWebTokenAuthentication, )

    def patch(self, request, *args, **kwargs):
        try:
            task = Task.objects.get(id=request.data['id'])
            if task.user == request.user:
                subtasks = request.data.pop('subtasks')
                for subtask in subtasks:
                    sub = SubTask.objects.get(title__contains=subtask['title'], user=request.user)
                    sub.is_subtask = True
                    sub.save()
                return Response({
                    'success': True,
                    'message': 'Updated data'
                }, status=status.HTTP_200_OK)
            return Response({
                'success': False,
                'message': "Cannot update someone else's data"
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


def get_tasks(tasks, request):
    task_list = []
    subtask_list = []
    objects = {}
    sub_objects = {}
    for task in tasks:
        subtasks = SubTask.objects.filter(task=task, user__first_name__contains=task.created_by.split(' ')[0])
        for subtask in subtasks:
            sub_objects['title'] = subtask.title
            subtask_list.append(sub_objects)
            sub_objects = {}
        objects['id'] = task.id
        objects['task'] = task.task
        objects['created_by'] = task.created_by
        objects['subtasks'] = subtask_list
        objects['is_taken'] = False
        if request.user in task.user.all():
            objects['is_taken'] = True
        task_list.append(objects)
        objects = {}
        subtask_list = []
    return task_list

