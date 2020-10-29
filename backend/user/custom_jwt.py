def jwt_payload_handler(user):
    return {
        'user_id': user.pk,
        'email': user.email,
        'is_moderator': user.is_moderator
    }
