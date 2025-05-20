from django.db import models
from django.conf import settings
from shop.models import Product
from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    product = models.ForeignKey(Product, related_name='product_reviews', on_delete=models.CASCADE) # Changed related_name
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='reviews', on_delete=models.SET_NULL, null=True, blank=True) # User can be optional if you allow anonymous reviews
    user_name = models.CharField(max_length=100, help_text="Name of the reviewer (can be guest)") # For guest or if user prefers different display name
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    # is_approved = models.BooleanField(default=True) # Optional: for moderation

    class Meta:
        ordering = ('-created_at',)
        # unique_together = ('product', 'user') # Optional: if a user can only review a product once

    def __str__(self):
        return f"Review for {self.product.name} by {self.user_name or self.user.username if self.user else 'Guest'}"

    # Optional: Add a signal to update product's average_rating and reviews_count
    # when a review is saved or deleted.
    # from django.db.models.signals import post_save, post_delete
    # from django.dispatch import receiver
    # from django.db.models import Avg
    #
    # @receiver(post_save, sender=Review)
    # @receiver(post_delete, sender=Review)
    # def update_product_rating(sender, instance, **kwargs):
    #     product = instance.product
    #     reviews = Review.objects.filter(product=product) # , is_approved=True
    #     product.reviews_count = reviews.count()
    #     product.average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0
    #     product.save(update_fields=['reviews_count', 'average_rating'])