from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Tag, OTP
from .forms import UserChangeForm, UserCreationForm


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    readonly_fields = ('date_joined', 'last_login',)

    list_display = ('email', 'first_name', 'last_name', 'gender', 'staff', 'admin', 'is_moderator', )
    list_filter = ('active', 'staff', 'admin', 'is_moderator',)
    fieldsets = (
        ('Login Info', {'fields': ('email', 'password')}),
        ('Primary Info', {'fields': ('first_name', 'last_name', 'gender', 'dob')}),
        ('Secondary Info', {'fields': ('country', 'counter')}),
        ('Permissions', {'fields': ('active', 'staff', 'admin', 'is_otp_verified', 'is_moderator')}),
        ('Time', {'fields': ('date_joined', 'last_login',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )
    search_fields = ('email', 'first_name', 'last_name',)
    ordering = ('email', 'first_name', 'last_name',)
    filter_horizontal = ()


admin.site.site_header = 'Ocean'
admin.site.register(User, UserAdmin)
admin.site.register(Tag)
admin.site.register(OTP)
admin.site.unregister(Group)
