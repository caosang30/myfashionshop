from django.urls import path
from . import views

urlpatterns = [
    path('cart/', views.cart_page, name='cart'),
    path('checkout/', views.checkout, name='checkout'),
    path('success/<int:invoice_id>/', views.checkout_success, name='checkout_success'),
]
