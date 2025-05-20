from django.contrib import admin
from .models import Order, OrderItem

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    raw_id_fields = ['product'] # Use a searchable widget for product
    extra = 0
    readonly_fields = ['price', 'get_cost']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user_email_display', 'status', 'is_paid', 'created_at', 'get_total_cost']
    list_filter = ['is_paid', 'status', 'created_at']
    search_fields = ['id', 'first_name', 'last_name', 'email', 'braintree_id']
    inlines = [OrderItemInline]
    readonly_fields = ['created_at', 'updated_at', 'get_total_cost']
    list_editable = ['status', 'is_paid']

    fieldsets = (
        ('Order Information', {
            'fields': ('id', 'user', ('first_name', 'last_name'), 'email', 'status')
        }),
        ('Address Information', {
            'fields': ('street_address', 'apartment_address', 'city', 'postal_code', 'country')
        }),
        ('Payment Information', {
            'fields': ('is_paid', 'braintree_id') # Add coupon, discount_amount if implemented
        }),
        ('Totals & Dates', {
            'fields': ('get_total_cost', 'created_at', 'updated_at')
        }),
    )

    def user_email_display(self, obj):
        return obj.user.email if obj.user else obj.email
    user_email_display.short_description = "User/Email"

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['order', 'product', 'price', 'quantity', 'get_cost']
    list_filter = ['order__status']
    search_fields = ['order__id', 'product__name']
    readonly_fields = ['get_cost']