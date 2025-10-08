from datetime import timezone

from django.db import models

# Create your models here.
from django.db import models
from products.models import ProductSize

class Invoice(models.Model):
    address = models.CharField(max_length=255)
    receiver = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    created_at = models.DateTimeField(auto_now_add=True)
    total = models.FloatField()
    is_deleted = models.BooleanField(default=False)

class InvoiceItem(models.Model):
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="items")
    product_size = models.ForeignKey(ProductSize, on_delete=models.PROTECT)
    quantity = models.IntegerField()

    # def __str__(self):
    #     return f"{self.invoice} - {self.product_size} x {self.quantity}"
