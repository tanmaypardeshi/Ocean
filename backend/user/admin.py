from django.contrib import admin
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, Tag
from .forms import UserChangeForm, UserCreationForm


class UserAdmin(BaseUserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    readonly_fields = ('date_joined', 'last_login',)

    list_display = ('email', 'first_name', 'last_name', 'age', 'gender', 'staff', 'admin',)
    list_filter = ('active', 'staff', 'admin',)
    fieldsets = (
        ('Login Info', {'fields': ('email', 'password')}),
        ('Primary Info', {'fields': ('first_name', 'last_name', 'age', 'gender', 'dob')}),
        ('Secondary Info', {'fields': ('city', 'state', 'country',)}),
        ('Permissions', {'fields': ('active', 'staff', 'admin',)}),
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
admin.site.unregister(Group)
