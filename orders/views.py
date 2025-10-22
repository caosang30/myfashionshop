from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Invoice, InvoiceItem
from products.models import ProductSize
import json

@login_required
def checkout(request):
    """Hiển thị trang checkout"""
    return render(request, 'checkout.html')

@login_required
@require_http_methods(["POST"])
def create_invoice(request):
    """Tạo hóa đơn từ dữ liệu cart trong LocalStorage"""
    try:
        # Lấy dữ liệu cart từ form
        cart_data = request.POST.get('cart_data')
        if not cart_data:
            messages.error(request, 'Không có sản phẩm nào trong giỏ hàng')
            return redirect('cart:cart')
        
        cart_items = json.loads(cart_data)
        if not cart_items:
            messages.error(request, 'Giỏ hàng trống')
            return redirect('cart:cart')
        
        # Lấy thông tin người nhận
        address = request.POST.get('address')
        receiver = request.POST.get('receiver')
        phone = request.POST.get('phone')
        
        if not all([address, receiver, phone]):
            messages.error(request, 'Vui lòng điền đầy đủ thông tin')
            return redirect('checkout')
        
        # Tính tổng tiền
        total = 0
        invoice_items_data = []
        
        for item in cart_items:
            product_id = item.get('product_id')
            size_id = item.get('size_id')
            quantity = int(item.get('quantity', 1))
            
            try:
                product_size = ProductSize.objects.get(
                    product_id=product_id, 
                    size_id=size_id
                )
                item_total = product_size.product.price * quantity
                total += item_total
                
                invoice_items_data.append({
                    'product_size': product_size,
                    'quantity': quantity,
                    'price': product_size.product.price
                })
            except ProductSize.DoesNotExist:
                messages.error(request, f'Sản phẩm không tồn tại hoặc đã bị xóa')
                return redirect('cart:cart')
        
        # Tạo hóa đơn
        invoice = Invoice.objects.create(
            user=request.user,
            address=address,
            receiver=receiver,
            phone=phone,
            total=total
        )
        
        # Tạo các item hóa đơn
        for item_data in invoice_items_data:
            InvoiceItem.objects.create(
                invoice=invoice,
                product_size=item_data['product_size'],
                quantity=item_data['quantity']
            )
        
        messages.success(request, 'Đặt hàng thành công!')
        return redirect('orders:order_success', invoice_id=invoice.id)
        
    except json.JSONDecodeError:
        messages.error(request, 'Dữ liệu giỏ hàng không hợp lệ')
        return redirect('cart:cart')
    except Exception as e:
        messages.error(request, f'Có lỗi xảy ra: {str(e)}')
        return redirect('cart:cart')

@login_required
def order_success(request, invoice_id):
    """Hiển thị trang thành công đặt hàng"""
    try:
        invoice = Invoice.objects.get(id=invoice_id, user=request.user)
        return render(request, 'order_success.html', {'invoice': invoice})
    except Invoice.DoesNotExist:
        messages.error(request, 'Hóa đơn không tồn tại')
        return redirect('home')
