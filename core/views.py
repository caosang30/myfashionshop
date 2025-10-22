# core/views.py
from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from products.models import Product, Category, ProductSize
from orders.models import Invoice, InvoiceItem
import json

def home(request):
    categories = Category.objects.filter(hide=False)
    products = Product.objects.filter(hide=False)
    return render(request, "home.html", {
        "categories": categories,
        "products": products,
    })

# Cart views
def cart_view(request):
    """Display cart page - cart data is stored in LocalStorage"""
    return render(request, 'cart.html')

@require_http_methods(["POST"])
@login_required
def checkout(request):
    """Process checkout from LocalStorage cart data"""
    try:
        # Get cart data from POST request
        data = json.loads(request.body)
        cart_items = data.get('cart_items', [])
        receiver = data.get('receiver', '')
        address = data.get('address', '')
        phone = data.get('phone', '')
        
        if not cart_items:
            return JsonResponse({'success': False, 'error': 'Giỏ hàng trống'}, status=400)
        
        # Calculate total
        total = 0
        invoice_items = []
        
        for item in cart_items:
            product_size_id = item.get('product_size_id')
            quantity = item.get('quantity', 1)
            
            try:
                product_size = ProductSize.objects.select_related('product').get(id=product_size_id)
                item_total = product_size.product.price * quantity
                total += item_total
                invoice_items.append({
                    'product_size': product_size,
                    'quantity': quantity
                })
            except ProductSize.DoesNotExist:
                return JsonResponse({
                    'success': False, 
                    'error': f'Sản phẩm không tồn tại'
                }, status=400)
        
        # Create invoice
        invoice = Invoice.objects.create(
            user=request.user,
            receiver=receiver,
            address=address,
            phone=phone,
            total=total
        )
        
        # Create invoice items
        for item_data in invoice_items:
            InvoiceItem.objects.create(
                invoice=invoice,
                product_size=item_data['product_size'],
                quantity=item_data['quantity']
            )
        
        return JsonResponse({
            'success': True,
            'invoice_id': invoice.id,
            'message': 'Đặt hàng thành công!'
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'error': 'Dữ liệu không hợp lệ'}, status=400)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@require_http_methods(["GET"])
def get_product_info(request, product_size_id):
    """API endpoint to get product information by product_size_id"""
    try:
        product_size = ProductSize.objects.select_related('product', 'size').get(id=product_size_id)
        return JsonResponse({
            'success': True,
            'product': {
                'id': product_size.product.id,
                'name': product_size.product.name,
                'price': product_size.product.price,
                'image': product_size.product.image.url if product_size.product.image else None,
                'size': product_size.size.name,
                'product_size_id': product_size.id
            }
        })
    except ProductSize.DoesNotExist:
        return JsonResponse({'success': False, 'error': 'Sản phẩm không tồn tại'}, status=404)

