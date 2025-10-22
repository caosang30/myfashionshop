from django.urls import path
from . import views

urlpatterns = [
    path('', views.product_list, name='home'),           # /products/
    path('<int:product_id>/', views.product_detail, name='product_detail'),  # /products/1/
    path('category/<int:category_id>/', views.product_by_category, name='product_by_category'),
    path('<int:product_id>/sizes/', views.product_sizes, name='product_sizes'),
]

