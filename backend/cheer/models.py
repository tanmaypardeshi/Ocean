from django.db import models
from user.models import User


class Task(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task')
    task = models.TextField(default='')
    is_taken = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - {self.task}'


class SubTask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtask')
    title = models.TextField(default='')
    is_subtask = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.task.user.first_name} {self.task.user.last_name} - {self.title}'
