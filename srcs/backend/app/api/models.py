# I SUGEST TO DELETE THIS BELLOW as Django does not own the database and we will not use ORM

from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)     # optional description
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="EUR")

    def __str__(self):
        return self.name


'''
class User(models.model):
    name = models.CharField(max_length=30)

'''
# Create your models here.
