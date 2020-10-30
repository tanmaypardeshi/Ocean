from rest_framework import serializers
from .models import Comment


class RecursiveSerializer(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class CommentSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)
    comment = RecursiveSerializer(many=True, read_only=True)

    class Meta:
        model = Comment
        fields = ('id', 'post_id', 'first_name', 'last_name', 'content', 'is_anonymous', 'published_at', 'parent', 'comment',)
