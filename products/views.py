from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from .models import Product, Category, ProductSize
from django.db.models import Q
def product_list(request):
    categories = Category.objects.filter(hide=False)
    query = request.GET.get('search')
    if query:
        products = Product.objects.filter(
            Q(name__icontains=query) | Q(category__name__icontains=query),
            hide=False
        ).distinct()
    else:
        products = Product.objects.filter(hide=False)
    return render(request, 'home.html', {
        'categories': categories,
        'products': products,
        'search_query': query,
    })

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    return render(request, 'products/product_detail.html', {'product': product})

def product_by_category(request, category_id):
    categories = Category.objects.filter(hide=False)
    category = get_object_or_404(Category, id=category_id)
    products = Product.objects.filter(category=category, hide=False)
    return render(request, 'home.html', {
        'categories': categories,
        'products': products,
        'active_category': category.id,
    })


def product_sizes(request, product_id):
    # JSON API: sizes available for a product
    sizes = (
        ProductSize.objects.filter(product_id=product_id)
        .select_related('size')
        .values('size_id', 'size__name')
    )
    data = {'sizes': [{'id': s['size_id'], 'name': s['size__name']} for s in sizes]}
    return JsonResponse(data)
