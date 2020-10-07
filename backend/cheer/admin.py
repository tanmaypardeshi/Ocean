from django.contrib import admin
from .models import Task, SubTask


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['user', 'task', 'is_taken']
    list_filter = ['is_taken']


@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_filter = ['is_subtask']