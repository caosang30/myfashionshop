from django.contrib import admin
from django.utils.html import format_html

from orders.models import Invoice, InvoiceItem

# Register your models here.
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'address', 'receiver', 'phone', 'formatted_created_at', 'formatted_total')

    readonly_fields = ('formatted_created_at', 'invoice_items_display', 'formatted_total_display')
    fields = ('address', 'receiver', 'phone', 'formatted_created_at' , 'invoice_items_display', 'formatted_total_display', 'is_deleted')
    ordering = ('-created_at',)

    # Permissions
    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    # Show invoice details
    def invoice_items_display(self, obj):
        items = obj.items.all()
        if not items.exists():
            return "Không có sản phẩm nào trong hóa đơn này."

        html = """
        <table style="border-collapse: collapse; width: 100%;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 8px; border: 1px solid #ccc;">Product</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Quantity</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Unit Price</th>
                    <th style="padding: 8px; border: 1px solid #ccc;">Total Price</th>
                </tr>
            </thead>
            <tbody>
        """

        for item in items:
            product = item.product_size
            quantity = item.quantity
            unit_price = item.product_size.product.price
            total_price = unit_price * quantity

            html += f"""
                <tr>
                    <td style="padding: 8px; border: 1px solid #ccc;">{product}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: center;">{quantity}</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">{unit_price:,.0f}đ</td>
                    <td style="padding: 8px; border: 1px solid #ccc; text-align: right;">{total_price:,.0f}đ</td>
                </tr>
            """

        html += "</tbody></table>"
        return format_html(html)

    invoice_items_display.short_description = "Invoice Details"

    # Format created_at column in list_display
    def formatted_created_at(self, obj):
        return obj.created_at.strftime("%d/%m/%Y %H:%M:%S") if obj.created_at else ""
    formatted_created_at.short_description = "Created at"

    # Format total column in list_display
    def formatted_total(self, obj):
        return f"{obj.total:,.0f}đ".replace(",", ".")
    formatted_total.short_description = "Total"

    def formatted_total_display(self, obj):
        formatted = f"{obj.total:,.0f}đ".replace(",", ".")
        return format_html(f"<b>{formatted}</b>")
    formatted_total_display.short_description = "Total"

# @admin.register(InvoiceItem)
# class InvoiceItemAdmin(admin.ModelAdmin):
#     list_display = ()