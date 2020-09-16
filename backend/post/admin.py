from django.contrib import admin
from .models import Post, Tag, Like


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['author', 'title']


admin.site.register(Tag)
admin.site.register(Like)

