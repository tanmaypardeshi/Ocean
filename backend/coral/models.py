from django.db import models

from user.models import User


class Chat(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat')
    createdAt = models.DateTimeField(auto_now_add=True)
    text = models.TextField(default='')
    type = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.pk} - {self.text}"
