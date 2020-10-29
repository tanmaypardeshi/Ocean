from django.contrib import admin
from .models import Post, Tag, Like, Comment, Delete


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title']
    ordering = ['published_at']


admin.site.register(Tag)
admin.site.register(Like)
admin.site.register(Comment)
admin.site.register(Delete)

