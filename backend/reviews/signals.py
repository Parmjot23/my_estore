# backend/reviews/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Review  # Assuming Review model is in the same app
# Import Product model carefully to avoid circularity if Review model imports it
# If Product is in another app, e.g., 'shop', it's usually safer:
from shop.models import Product


@receiver(post_save, sender=Review)
@receiver(post_delete, sender=Review)
def update_product_rating_and_count(sender, instance, **kwargs):
    product = instance.product
    action = 'delete' if kwargs.get('signal') == post_delete else 'save'

    # Filter for approved reviews if you have an is_approved field and want to use it
    # reviews_qs = Review.objects.filter(product=product, is_approved=True)
    reviews_qs = Review.objects.filter(product=product)

    product.reviews_count = reviews_qs.count()
    avg_rating_dict = reviews_qs.aggregate(avg_rating=Avg('rating'))
    product.average_rating = avg_rating_dict['avg_rating'] if avg_rating_dict['avg_rating'] is not None else 0.0

    product.save(update_fields=['reviews_count', 'average_rating'])

