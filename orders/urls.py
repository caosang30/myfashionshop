from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('create-invoice/', views.create_invoice, name='create_invoice'),
    path('order-success/', views.order_success, name='order_success'),
]
