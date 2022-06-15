from django.contrib.auth.models import AbstractUser
from django.db import models


 
class User(AbstractUser):
    pass
    # add additional fields in here

    def __str__(self):
        return self.username

    class Meta:
        db_table = "user"

    def natural_key(self):
        return (self.username)
