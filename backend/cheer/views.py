from django.core.paginator import Paginator
from rest_framework import generics
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_jwt.authentication import JSONWebTokenAuthentication

from .models import Task, SubTask
from user.models import User


class GetTaskView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def get(self, request, *args, **kwargs):
        try:
            tasks = Task.objects.all()
            paginatior = Paginator(get_tasks(tasks, request), 15)
            page = paginatior.page(self.kwargs['id'])
            task_list = page.object_list
            return Response({
                'success': True,
                'total tasks': tasks.count(),
                'message': f'Fetched {len(task_list)} tasks',
                'post_list': task_list
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class PostTaskView(generics.GenericAPIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

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
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

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
            progress1 = 0
            progress2 = 0
            done = 0
            total = 0
            subtask_list1 = []
            subtask_list2 = []
            sub_objects = {}
            task = Task.objects.get(id=kwargs['id'])
            subtasks = SubTask.objects.filter(task=task, user__first_name__contains=task.created_by.split(' ')[0])
            total = subtasks.count()
            for subtask in subtasks:
                sub_objects['title'] = subtask.title
                sub_objects['is_subtask'] = subtask.is_subtask
                if subtask.is_subtask:
                    done = done + 1
                subtask_list1.append(sub_objects)
                sub_objects = {}
            progress1 = done/total * 100;
            user = User.objects.get(email=request.user)
            name = user.first_name + ' ' + user.last_name
            done = 0
            total = 0
            if not task.created_by == name:
                subtasks = SubTask.objects.filter(task=task, user=request.user)
                total = subtasks.count()
                for subtask in subtasks:
                    sub_objects['title'] = subtask.title
                    sub_objects['is_subtask'] = subtask.is_subtask
                    if subtask.is_subtask:
                        done = done + 1
                    subtask_list2.append(sub_objects)
                    sub_objects = {}
                if len(subtask_list2) != 0:
                    progress2 = done/total * 100

            return Response({
                'success': True,
                'message': f"Fetched task ID {kwargs['id']} successfully",
                'data': {
                    'task': task.task,
                    'created_by': task.created_by,
                    'subtasks': subtask_list1,
                    'current_user': subtask_list2,
                    'progress1': progress1,
                    'progress2': progress2
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': e.__str__()
            }, status=status.HTTP_400_BAD_REQUEST)


class TakeTaskView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def post(self, request, *args, **kwargs):
        try:
            task = Task.objects.get(id=request.data['id'])
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



class UpdateProgressView(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (JSONWebTokenAuthentication,)

    def patch(self, request, *args, **kwargs):
        try:
            task = Task.objects.get(id=request.data['id'])
            subtasks = request.data.pop('subtasks')
            for subtask in subtasks:
                sub = SubTask.objects.get(task=task, title__contains=subtask['title'], user=request.user)
                sub.is_subtask = True
                sub.save()
            return Response({
                'success': True,
                'message': 'Updated data'
            }, status=status.HTTP_200_OK)
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
            sub_objects['is_subtask'] = subtask.is_subtask
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


def get_users(current_user):
    current_user_object = {}
    total = 1
    completed = 0
    current_user_object['name'] = f"{current_user.first_name} {current_user.last_name}"
    subs = SubTask.objects.filter(user=current_user)
    temp_list = []
    temp_object = {}
    for s in subs:
        temp_object['title'] = s.title
        temp_object['is_subtask'] = s.is_subtask
        if s.is_subtask:
            completed = completed + 1
        temp_list.append(temp_object)
        total = total + 1
        temp_object = {}
    current_user_object['table'] = temp_list
    current_user_object['progress'] = completed / total * 100
    return current_user_object
