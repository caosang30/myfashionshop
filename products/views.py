from django.shortcuts import render, get_object_or_404
from .models import Product, Category
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
    return render(request, 'product_detail.html', {'product': product})

def product_by_category(request, category_id):
    categories = Category.objects.filter(hide=False)
    category = get_object_or_404(Category, id=category_id)
    products = Product.objects.filter(category=category, hide=False)
    return render(request, 'home.html', {
        'categories': categories,
        'products': products,
        'active_category': category.id,
    })
