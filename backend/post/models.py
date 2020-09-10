from django.db import models

from user.models import User


class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user')
    title = models.TextField(default='')
    description = models.TextField(default='')
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    published_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} - {self.title}"

    def author(self):
        return f"{self.user.first_name} {self.user.last_name}"


class Tag(models.Model):
    post = models.ManyToManyField(Post, related_name='post_tag')
    tag_name = models.CharField(max_length=20)

    def __str__(self):
        return self.tag_name
