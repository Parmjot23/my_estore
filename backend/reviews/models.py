# backend/reviews/models.py
from django.db import models
from django.conf import settings
from shop.models import Product
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver


class Review(models.Model):
    product = models.ForeignKey(Product, related_name='product_reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.SET_NULL, null=True,
                             blank=True)
    user_name = models.CharField(max_length=100, help_text="Name of the reviewer (can be guest)")
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # is_approved = models.BooleanField(default=True) # Optional: for moderation

    class Meta:
        ordering = ('-created_at',)
        # unique_together = ('product', 'user') # Optional: if a user can only review a product once

    def __str__(self):
        user_display_name = "Guest"
        if self.user:
            user_display_name = self.user.username
        elif self.user_name:
            user_display_name = self.user_name
        return f"Review for {self.product.name} by {user_display_name}"


