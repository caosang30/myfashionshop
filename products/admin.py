from django.contrib import admin
from django import forms
from products.models import Product, ProductSize, Size, Category

# Register your models here.
class ProductSizeInlineForm(forms.ModelForm):
    class Meta:
        model = ProductSize
        fields = '__all__'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # ⚙️ Tắt các nút edit/view, chỉ giữ nút add (+)
        self.fields['size'].widget.can_change_related = False
        self.fields['size'].widget.can_delete_related = False
        self.fields['size'].widget.can_view_related = False
        self.fields['size'].widget.can_add_related = True  # chỉ giữ nút +

class ProductSizeInline(admin.StackedInline):
    model = ProductSize
    extra = 0
    form = ProductSizeInlineForm

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'category', 'name', 'formatted_price')
    search_fields = ('id', 'name', 'category__name')

    fields = ('category', 'name', 'price', 'image', 'hide')
    inlines = [ProductSizeInline]

@admin.register(Size)
class SizeAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('id', 'name',)
    ordering = ('id',)

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('id', 'name',)
    ordering = ('id',)
