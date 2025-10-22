from django.shortcuts import render, redirect
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpRequest, HttpResponseBadRequest
from django.db import transaction
from products.models import Product, ProductSize, Size
from .models import Invoice, InvoiceItem
import json


def checkout(request: HttpRequest):
    # Render checkout page; cart data is provided by JS from LocalStorage
    return render(request, 'checkout.html')


@login_required
@require_http_methods(["POST"]) 
def create_invoice(request: HttpRequest):
    # Expect JSON body with keys: address, receiver, phone, items: [{product_id, size_id, quantity}]
    try:
        payload = json.loads(request.body.decode('utf-8'))
    except Exception:
        return HttpResponseBadRequest('Invalid JSON')

    address = payload.get('address', '').strip()
    receiver = payload.get('receiver', '').strip()
    phone = payload.get('phone', '').strip()
    items = payload.get('items', [])

    if not address or not receiver or not phone or not isinstance(items, list) or not items:
        return HttpResponseBadRequest('Missing fields')

    # Build product_size list and compute total
    product_size_ids = []
    quantities = []
    total = 0.0
    for item in items:
        product_id = item.get('product_id')
        size_id = item.get('size_id')
        quantity = int(item.get('quantity', 0))
        if not product_id or quantity <= 0:
            return HttpResponseBadRequest('Invalid item')

        # Find ProductSize if provided, else None
        product = Product.objects.filter(id=product_id, hide=False).first()
        if not product:
            return HttpResponseBadRequest('Product not found')

        product_size = None
        if size_id:
            product_size = ProductSize.objects.filter(product_id=product_id, size_id=size_id).first()
            if not product_size:
                return HttpResponseBadRequest('Invalid size for product')

        product_size_ids.append(product_size.id if product_size else None)
        quantities.append(quantity)
        total += float(product.price) * quantity

    with transaction.atomic():
        invoice = Invoice.objects.create(
            user=request.user,
            address=address,
            receiver=receiver,
            phone=phone,
            total=total,
        )
        for ps_id, qty in zip(product_size_ids, quantities):
            InvoiceItem.objects.create(
                invoice=invoice,
                product_size_id=ps_id,
                quantity=qty,
            )

    messages.success(request, 'Đặt hàng thành công!')
    return JsonResponse({'success': True, 'invoice_id': invoice.id})
