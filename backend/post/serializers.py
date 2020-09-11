from rest_framework import serializers

from .models import Post, Tag


class PostSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = Post
        fields = ['first_name', 'last_name', 'title', 'description', 'likes', 'comments', 'published_at']