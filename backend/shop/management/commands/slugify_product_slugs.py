from django.core.management.base import BaseCommand
from django.utils.text import slugify

from shop.models import Product


class Command(BaseCommand):
    help = "Convert all product slugs to a slugified version of their name, ensuring uniqueness."

    def handle(self, *args, **options):
        for product in Product.objects.all():
            base_slug = slugify(product.name)
            unique_slug = base_slug
            counter = 1
            while Product.objects.filter(slug=unique_slug).exclude(pk=product.pk).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1
            if product.slug != unique_slug:
                product.slug = unique_slug
                product.save(update_fields=["slug"])
                self.stdout.write(self.style.SUCCESS(f"Updated {product.name} -> {product.slug}"))
        self.stdout.write(self.style.SUCCESS("All product slugs updated."))
