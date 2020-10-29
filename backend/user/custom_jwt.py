from datetime import datetime
from calendar import timegm
from rest_framework_jwt.settings import api_settings


def jwt_payload_handler(user):
    return {
        'user_id': user.pk,
        'username': user.email,
        'is_moderator': user.is_moderator,
    }
