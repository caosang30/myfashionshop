from django.contrib import admin
from django import forms

from products.models import Product

# Register your models here.
class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = ['category', 'name', 'price', 'image', 'hide']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form__control', 'required': True}),
            'price': forms.NumberInput(attrs={'class': 'form__control', 'required': True}),
            'category': forms.Select(attrs={'class': 'form__control', 'required': True}),
            'image': forms.FileInput(attrs={'class': 'form__control'}),
            'hide': forms.CheckboxInput(attrs={'class': 'form__checkbox'}),
        }

    def clean_price(self):
        price = self.cleaned_data['price']
        if price <= 0:
            raise forms.ValidationError("Giá phải lớn hơn 0!")
        return price