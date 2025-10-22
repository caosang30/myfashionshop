# core/views.py
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from products.models import Product, Category, ProductSize
import json

def home(request):
    categories = Category.objects.filter(hide=False)
    products = Product.objects.filter(hide=False)
    return render(request, "home.html", {
        "categories": categories,
        "products": products,
    })

def cart_view(request):
    """Hiển thị trang giỏ hàng"""
    return render(request, "cart.html")

@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    """API để thêm sản phẩm vào giỏ hàng (chỉ trả về JSON)"""
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        size_id = data.get('size_id')
        quantity = int(data.get('quantity', 1))
        
        # Kiểm tra sản phẩm và size có tồn tại không
        product = get_object_or_404(Product, id=product_id, hide=False)
        product_size = get_object_or_404(ProductSize, product=product, size_id=size_id)
        
        return JsonResponse({
            'success': True,
            'message': f'Đã thêm {product.name} - Size {product_size.size.name} vào giỏ hàng',
            'product': {
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'image': product.image.url if product.image else '',
                'size': product_size.size.name
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def update_cart_item(request):
    """API để cập nhật số lượng sản phẩm trong giỏ hàng"""
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        size_id = data.get('size_id')
        quantity = int(data.get('quantity', 1))
        
        # Kiểm tra sản phẩm và size có tồn tại không
        product = get_object_or_404(Product, id=product_id, hide=False)
        product_size = get_object_or_404(ProductSize, product=product, size_id=size_id)
        
        return JsonResponse({
            'success': True,
            'message': 'Đã cập nhật số lượng sản phẩm',
            'product': {
                'id': product.id,
                'name': product.name,
                'price': product.price,
                'image': product.image.url if product.image else '',
                'size': product_size.size.name
            }
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }, status=400)

@csrf_exempt
@require_http_methods(["POST"])
def remove_from_cart(request):
    """API để xóa sản phẩm khỏi giỏ hàng"""
    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        size_id = data.get('size_id')
        
        # Kiểm tra sản phẩm và size có tồn tại không
        product = get_object_or_404(Product, id=product_id, hide=False)
        product_size = get_object_or_404(ProductSize, product=product, size_id=size_id)
        
        return JsonResponse({
            'success': True,
            'message': f'Đã xóa {product.name} - Size {product_size.size.name} khỏi giỏ hàng'
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }, status=400)

def get_cart_data(request):
    """API để lấy thông tin sản phẩm trong giỏ hàng từ LocalStorage"""
    try:
        data = json.loads(request.body)
        cart_items = data.get('cart_items', [])
        
        cart_data = []
        total = 0
        
        for item in cart_items:
            product_id = item.get('product_id')
            size_id = item.get('size_id')
            quantity = int(item.get('quantity', 1))
            
            try:
                product = Product.objects.get(id=product_id, hide=False)
                product_size = ProductSize.objects.get(product=product, size_id=size_id)
                
                item_total = product.price * quantity
                total += item_total
                
                cart_data.append({
                    'product_id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'image': product.image.url if product.image else '',
                    'size': product_size.size.name,
                    'quantity': quantity,
                    'total': item_total
                })
            except (Product.DoesNotExist, ProductSize.DoesNotExist):
                continue
        
        return JsonResponse({
            'success': True,
            'cart_data': cart_data,
            'total': total
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Lỗi: {str(e)}'
        }, status=400)

