from django.db import models
from user.models import User


class Task(models.Model):
    user = models.ManyToManyField(User, related_name='task')
    created_by = models.CharField(default='', max_length=50)
    task = models.TextField(default='')

    def __str__(self):
        return f'{self.task}'


class SubTask(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='subtask_user')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtask')
    title = models.TextField(default='')
    is_subtask = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - {self.title}'
