from django.db import models

from user.models import User, Tag


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    title = models.TextField(default='')
    description = models.TextField(default='')
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    published_at = models.DateTimeField(auto_now_add=True)