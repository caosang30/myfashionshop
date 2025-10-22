from django.urls import path
from . import views

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('invoice/create/', views.create_invoice, name='create_invoice'),
]
