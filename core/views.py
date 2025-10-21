# core/views.py
from django.shortcuts import render
from products.models import Product, Category

def home(request):
    categories = Category.objects.filter(hide=False)
    products = Product.objects.filter(hide=False)
    return render(request, "home.html", {
        "categories": categories,
        "products": products,
    })

