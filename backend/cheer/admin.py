from django.contrib import admin
from .models import Task, SubTask


admin.site.register(SubTask)
admin.site.register(Task)
