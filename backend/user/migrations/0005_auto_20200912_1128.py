# Generated by Django 3.1.1 on 2020-09-12 05:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0004_remove_user_age'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='city',
        ),
        migrations.RemoveField(
            model_name='user',
            name='state',
        ),
    ]
