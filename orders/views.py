from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpRequest, HttpResponse
from .models import Invoice, InvoiceItem
from products.models import ProductSize, Product
from django.db import transaction


def cart_page(request: HttpRequest) -> HttpResponse:
    return render(request, 'orders/cart.html')


@login_required
@require_http_methods(["GET", "POST"])
def checkout(request: HttpRequest) -> HttpResponse:
    if request.method == 'GET':
        return render(request, 'orders/checkout.html')

    # POST: create invoice from submitted form data; items come as JSON payload in hidden field
    receiver = request.POST.get('receiver', '').strip()
    address = request.POST.get('address', '').strip()
    phone = request.POST.get('phone', '').strip()
    items_json = request.POST.get('items_json', '[]')

    if not receiver or not address or not phone:
        messages.error(request, 'Vui lòng nhập đầy đủ thông tin người nhận.')
        return redirect('checkout')

    import json
    try:
        items = json.loads(items_json)
    except Exception:
        messages.error(request, 'Dữ liệu giỏ hàng không hợp lệ.')
        return redirect('checkout')

    if not items:
        messages.error(request, 'Giỏ hàng trống.')
        return redirect('cart')

    # items format: [{"productId": 1, "sizeId": 2, "quantity": 3, "price": 120000}]
    with transaction.atomic():
        total = 0.0
        invoice = Invoice.objects.create(
            user=request.user,
            address=address,
            receiver=receiver,
            phone=phone,
            total=0.0,
        )

        for item in items:
            product_id = int(item.get('productId'))
            size_id = int(item.get('sizeId'))
            quantity = int(item.get('quantity'))
            price = float(item.get('price'))
            total += price * quantity
            product_size = get_object_or_404(ProductSize, product_id=product_id, size_id=size_id)
            InvoiceItem.objects.create(
                invoice=invoice,
                product_size=product_size,
                quantity=quantity,
            )

        invoice.total = total
        invoice.save(update_fields=["total"])

    messages.success(request, 'Đặt hàng thành công!')
    return redirect('checkout_success', invoice_id=invoice.id)


def checkout_success(request: HttpRequest, invoice_id: int) -> HttpResponse:
    invoice = get_object_or_404(Invoice, id=invoice_id)
    return render(request, 'orders/success.html', {"invoice": invoice})

