from django.urls import path
from . import cart_views

app_name = 'cart'

urlpatterns = [
    path('', cart_views.cart_view, name='cart'),
    path('get-product-info/', cart_views.get_product_info, name='get_product_info'),
    path('checkout-cart/', cart_views.checkout_view, name='checkout_cart'),
    path('checkout/', cart_views.checkout_form_view, name='checkout_form'),
    path('process-order/', cart_views.process_order, name='process_order'),
]