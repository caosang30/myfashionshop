# Create your models here.
from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=255)
    hide = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class Size(models.Model):
    name = models.CharField(max_length=10, unique=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    name = models.CharField(max_length=255)
    price = models.FloatField()
    image = models.ImageField(upload_to='product_images/', blank=True, null=True)
    hide = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def formatted_price(self):
        return f"{self.price:,.0f}đ".replace(",", ".")

class ProductSize(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    size = models.ForeignKey(Size, on_delete=models.PROTECT)

    class Meta:
        unique_together = ('product', 'size')

    def __str__(self):
        return f"{self.product.name} - {self.size.name}"
