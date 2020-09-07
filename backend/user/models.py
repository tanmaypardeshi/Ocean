from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from .managers import UserManager


class User(AbstractBaseUser):
    email = models.EmailField(max_length=120, unique=True)
    first_name = models.CharField(max_length=60)
    last_name = models.CharField(max_length=60)
    age = models.IntegerField(default=0)
    dob = models.DateField(max_length=8, null=True)
    gender = models.CharField(max_length=20)
    city = models.CharField(max_length=60)
    state = models.CharField(max_length=60)
    country = models.CharField(max_length=60)
    last_login = models.DateTimeField(auto_now_add=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    admin = models.BooleanField(default=False)
    staff = models.BooleanField(default=False)
    active = models.BooleanField(default=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email

    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"

    def get_short_name(self):
        return f"{self.first_name}"

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.staff

    @property
    def is_admin(self):
        return self.admin

    @property
    def is_active(self):
        return self.active


class Tag(models.Model):
    user = models.OneToOneField(User, related_name='tags', on_delete=models.CASCADE)
    productivity = models.BooleanField(False)
    self_help = models.BooleanField(False)
    self_improvement = models.BooleanField(False)
    personal_development = models.BooleanField(False)
    spirituality = models.BooleanField(False)
    motivation = models.BooleanField(False)
    positivity = models.BooleanField(False)
    career = models.BooleanField(False)
    discipline = models.BooleanField(False)
    relationships = models.BooleanField(False)
    success = models.BooleanField(False)
    depression = models.BooleanField(False)
    anxiety = models.BooleanField(False)
    ptsd = models.BooleanField(False)
    alcohol = models.BooleanField(False)
    internet_addiction = models.BooleanField(False)
    bipolar_disorder = models.BooleanField(False)
    social_anxiety_disorder = models.BooleanField(False)
    stress = models.BooleanField(False)
    sleep_disorder = models.BooleanField(False)
    empathy_deficit_disorder = models.BooleanField(False)

    def __str__(self):
        return self.user.email