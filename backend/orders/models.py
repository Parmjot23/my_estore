from django.db import models
from django.conf import settings  # To link to your custom User model if different
from shop.models import Product  # Assuming Product model is in your shop app


class Order(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
                             related_name='orders')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    street_address = models.CharField(max_length=250)
    apartment_address = models.CharField(max_length=250, blank=True, null=True)
    postal_code = models.CharField(max_length=20)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)  # Consider django-countries

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    is_paid = models.BooleanField(default=False)
    braintree_id = models.CharField(max_length=150, blank=True, null=True)  # For payment gateway transaction ID

    # Potentially add shipping and billing addresses if different from user's default
    # shipping_address = models.ForeignKey('accounts.Address', related_name='shipping_orders', on_delete=models.SET_NULL, null=True, blank=True)
    # billing_address = models.ForeignKey('accounts.Address', related_name='billing_orders', on_delete=models.SET_NULL, null=True, blank=True)

    # Coupon/Discount info
    # coupon = models.ForeignKey('coupons.Coupon', related_name='orders', null=True, blank=True, on_delete=models.SET_NULL)
    # discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
        ('REFUNDED', 'Refunded'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f"Order {self.id} by {self.email}"

    def get_total_cost(self):
        total_cost = sum(item.get_cost() for item in self.items.all())
        # if self.coupon:
        #     total_cost -= self.coupon.get_discount(total_cost) # Apply coupon discount
        # return max(0, total_cost) # Ensure total isn't negative
        return total_cost

    # get_total_amount_after_discount - if you have a coupon system


class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name='order_items',
                                on_delete=models.PROTECT)  # Or SET_NULL if product can be deleted
    price = models.DecimalField(max_digits=10, decimal_places=2)  # Price at the time of purchase
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return str(self.id)

    def get_cost(self):
        return self.price * self.quantity