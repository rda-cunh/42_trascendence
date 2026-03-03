from django.db import models


class Product(models.model):
    name = models.CharField(max_lenght=200)
    description = models.TextField(blank=True)     # optional description
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_lenght=3, default="EUR")

    def __str__(self):
        return self.name


'''
class User(models.model):
    name = models.CharField(max_length=30)

'''
# Create your models here.
