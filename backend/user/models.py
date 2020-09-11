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
    is_otp_verified = models.BooleanField(default=False)

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
    productivity = models.BooleanField(default=False)
    self_help = models.BooleanField(default=False)
    self_improvement = models.BooleanField(default=False)
    personal_development = models.BooleanField(default=False)
    spirituality = models.BooleanField(default=False)
    motivation = models.BooleanField(default=False)
    positivity = models.BooleanField(default=False)
    career = models.BooleanField(default=False)
    discipline = models.BooleanField(default=False)
    relationships = models.BooleanField(default=False)
    success = models.BooleanField(default=False)
    depression = models.BooleanField(default=False)
    anxiety = models.BooleanField(default=False)
    ptsd = models.BooleanField(default=False)
    alcohol = models.BooleanField(default=False)
    internet_addiction = models.BooleanField(default=False)
    bipolar = models.BooleanField(default=False)
    social_anxiety = models.BooleanField(default=False)
    stress = models.BooleanField(default=False)
    sleep = models.BooleanField(default=False)
    empathy_deficit = models.BooleanField(default=False)

    def __str__(self):
        return self.user.email


class OTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='otp')
    otp = models.IntegerField(default=0)
    counter = models.IntegerField(default=0)

    def __str__(self):
        return self.user.email