from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from products.models import Product, ProductSize
import json


def cart_view(request):
    """Display cart page"""
    return render(request, 'cart.html')


@csrf_exempt
def get_product_info(request):
    """Get product information for cart (AJAX endpoint)"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            product_id = data.get('product_id')
            size_id = data.get('size_id')
            
            product = get_object_or_404(Product, id=product_id)
            
            # Get product size if size_id is provided
            product_size = None
            if size_id:
                product_size = get_object_or_404(ProductSize, product=product, size_id=size_id)
            
            response_data = {
                'success': True,
                'product': {
                    'id': product.id,
                    'name': product.name,
                    'price': product.price,
                    'formatted_price': product.formatted_price(),
                    'image': product.image.url if product.image else None,
                },
                'size': {
                    'id': product_size.size.id,
                    'name': product_size.size.name
                } if product_size else None
            }
            
            return JsonResponse(response_data)
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
@csrf_exempt
def checkout_view(request):
    """Process checkout from cart data"""
    if request.method == 'POST':
        try:
            # Get cart data from request
            cart_data = json.loads(request.body)
            
            # Validate cart data
            if not cart_data or 'items' not in cart_data:
                return JsonResponse({'success': False, 'error': 'Cart is empty'})
            
            # Calculate total and validate items
            total = 0
            valid_items = []
            
            for item in cart_data['items']:
                try:
                    product = Product.objects.get(id=item['product_id'])
                    product_size = None
                    
                    if item.get('size_id'):
                        product_size = ProductSize.objects.get(
                            product=product, 
                            size_id=item['size_id']
                        )
                    
                    quantity = int(item['quantity'])
                    item_total = product.price * quantity
                    total += item_total
                    
                    valid_items.append({
                        'product': product,
                        'product_size': product_size,
                        'quantity': quantity,
                        'item_total': item_total
                    })
                    
                except (Product.DoesNotExist, ProductSize.DoesNotExist, ValueError):
                    continue
            
            if not valid_items:
                return JsonResponse({'success': False, 'error': 'No valid items in cart'})
            
            # Store validated cart data in session for checkout form
            request.session['checkout_cart'] = {
                'items': [
                    {
                        'product_id': item['product'].id,
                        'product_name': item['product'].name,
                        'product_price': item['product'].price,
                        'size_id': item['product_size'].size.id if item['product_size'] else None,
                        'size_name': item['product_size'].size.name if item['product_size'] else None,
                        'quantity': item['quantity'],
                        'item_total': item['item_total']
                    } for item in valid_items
                ],
                'total': total
            }
            
            return JsonResponse({
                'success': True, 
                'redirect_url': '/checkout/',
                'total': total
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})


@login_required
def checkout_form_view(request):
    """Display checkout form"""
    cart_data = request.session.get('checkout_cart')
    
    if not cart_data:
        return render(request, 'cart.html', {
            'error': 'No items in cart. Please add items to cart first.'
        })
    
    return render(request, 'checkout.html', {
        'cart_items': cart_data['items'],
        'total': cart_data['total']
    })


@login_required
@csrf_exempt
def process_order(request):
    """Process the final order and create invoice"""
    if request.method == 'POST':
        try:
            from orders.models import Invoice, InvoiceItem
            
            # Get cart data from session
            cart_data = request.session.get('checkout_cart')
            if not cart_data:
                return JsonResponse({'success': False, 'error': 'No cart data found'})
            
            # Get form data
            receiver = request.POST.get('receiver', '').strip()
            address = request.POST.get('address', '').strip()
            phone = request.POST.get('phone', '').strip()
            
            # Validate form data
            if not all([receiver, address, phone]):
                return JsonResponse({
                    'success': False, 
                    'error': 'Please fill in all required fields'
                })
            
            # Create invoice
            invoice = Invoice.objects.create(
                user=request.user,
                receiver=receiver,
                address=address,
                phone=phone,
                total=cart_data['total']
            )
            
            # Create invoice items
            for item in cart_data['items']:
                product_size = None
                if item['size_id']:
                    try:
                        product_size = ProductSize.objects.get(
                            product_id=item['product_id'],
                            size_id=item['size_id']
                        )
                    except ProductSize.DoesNotExist:
                        pass
                
                InvoiceItem.objects.create(
                    invoice=invoice,
                    product_size=product_size,
                    quantity=item['quantity']
                )
            
            # Clear cart data from session
            if 'checkout_cart' in request.session:
                del request.session['checkout_cart']
            
            return JsonResponse({
                'success': True,
                'message': 'Order placed successfully!',
                'invoice_id': invoice.id
            })
            
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    
    return JsonResponse({'success': False, 'error': 'Invalid request method'})