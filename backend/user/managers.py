from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, is_staff=False, is_active=True, is_admin=False):
        if not email:
            raise ValueError('Please enter email')
        if not password:
            raise ValueError('Please enter password')

        user = self.model(
            email=self.normalize_email(email)
        )
        user.set_password(password)
        user.admin = is_admin
        user.staff = is_staff
        user.active = is_active
        user.save(using=self._db)
        return user

    def create_staffuser(self, email, password=None):
        user = self.create_user(email=self.normalize_email(email), password=password, is_staff=True)
        return user

    def create_superuser(self, email, password=None):
        user = self.create_user(email=self.normalize_email(email), password=password, is_staff=True, is_admin=True)
        return user

