from django.contrib import admin
from .models import Task, SubTask, Taken


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['user', 'task']


@admin.register(SubTask)
class SubTaskAdmin(admin.ModelAdmin):
    list_filter = ['is_subtask']


admin.site.register(Taken)
