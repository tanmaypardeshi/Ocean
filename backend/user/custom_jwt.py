def jwt_payload_handler(user):
    tags = []
    if user.is_moderator:
        tags = list(user.user_tag.all().values_list('tag_name', flat=True))
    return {
        'user_id': user.pk,
        'username': user.email,
        'is_moderator': user.is_moderator,
        'tags': tags
    }
