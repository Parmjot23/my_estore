# shop/management/commands/auto_assign_brands.py

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from shop.models import Brand, PhoneModel, Product


class Command(BaseCommand):
    help = "Auto-assign brand and phone models for products based on their names, with collision-proof slugs."

    # Define substrings to detect for Apple iPhone models (14 series onward, etc.)
    APPLE_MODELS = [
        "iphone 14 pro max",
        "iphone 14 pro",
        "iphone 14 plus",
        "iphone 14",
        "iphone 15 pro max",
        "iphone 15 pro",
        "iphone 15 plus",
        "iphone 15",
        # Add more if needed
    ]

    # Define substrings to detect for Samsung
    SAMSUNG_MODELS = [
        "galaxy s23 ultra",
        "galaxy s23 plus",
        "galaxy s23+",
        "galaxy s23",
        "galaxy s24 ultra",
        "galaxy s24 plus",
        "galaxy s24+",
        "galaxy s24",
        "s23 ultra",  # Some products may only say "S23 Ultra" without "Galaxy"
        "s24 ultra",
        # Add more if needed
    ]

    def handle(self, *args, **options):
        """
        1. Ensure 'Apple', 'Samsung', and 'Other' brands exist.
        2. Create or get phone models for known Apple/Samsung names (handling slug collisions).
        3. Iterate all products and assign brand + phone models accordingly.
        """
        with transaction.atomic():
            # 1. Ensure the three base brands exist
            apple_brand, _ = Brand.objects.get_or_create(
                name="Apple",
                defaults={"slug": slugify("Apple")}
            )
            samsung_brand, _ = Brand.objects.get_or_create(
                name="Samsung",
                defaults={"slug": slugify("Samsung")}
            )
            other_brand, _ = Brand.objects.get_or_create(
                name="Other",
                defaults={"slug": slugify("Other")}
            )

            # 2. Ensure we have matching PhoneModel objects for Apple
            for model_name in self.APPLE_MODELS:
                self.create_or_get_phone_model(brand=apple_brand, model_name=model_name)

            # 2b. Ensure we have matching PhoneModel objects for Samsung
            for model_name in self.SAMSUNG_MODELS:
                self.create_or_get_phone_model(brand=samsung_brand, model_name=model_name)

            # 3. Iterate over products and assign brand + phone models
            all_products = Product.objects.all()
            for product in all_products:
                product_name_lower = product.name.lower()

                # Check if Apple
                if any(sub in product_name_lower for sub in self.APPLE_MODELS):
                    self.assign_brand_and_models(product, apple_brand, self.APPLE_MODELS)
                # Check if Samsung
                elif any(sub in product_name_lower for sub in self.SAMSUNG_MODELS):
                    self.assign_brand_and_models(product, samsung_brand, self.SAMSUNG_MODELS)
                else:
                    # Assign brand = Other
                    product.brand = other_brand
                    product.compatible_with.clear()
                    product.save()

                self.stdout.write(self.style.SUCCESS(f"Processed product: {product.name}"))

        self.stdout.write(self.style.SUCCESS("Brand and Phone Model auto-assignment complete."))

    def create_or_get_phone_model(self, brand, model_name):
        """
        Safely get or create a PhoneModel for the given brand and model_name,
        handling slug collisions before saving.
        """
        model_name_title = model_name.title()  # "iPhone 14 Pro" or "Galaxy S23+"
        try:
            # Attempt to get an existing phone model
            phone_model = PhoneModel.objects.get(brand=brand, name=model_name_title)
            return phone_model
        except PhoneModel.DoesNotExist:
            # Need to create one, ensuring slug is unique
            phone_model = PhoneModel(brand=brand, name=model_name_title)
            base_slug = slugify(f"{brand.name} {model_name_title}")
            unique_slug = base_slug
            counter = 1
            # Keep incrementing until we find a slug that doesn't collide
            while PhoneModel.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{counter}"
                counter += 1

            phone_model.slug = unique_slug
            phone_model.save()
            return phone_model

    def assign_brand_and_models(self, product, brand, model_list):
        """
        Assign 'brand' to 'product' and link the product with any phone models
        from 'model_list' that match in the product name. Clears old associations first.
        """
        product.brand = brand
        product.save()

        product.compatible_with.clear()  # remove stale associations
        name_lower = product.name.lower()

        for phone_model_substring in model_list:
            if phone_model_substring in name_lower:
                # Attempt to fetch the phone model we created
                model_name_title = phone_model_substring.title()
                try:
                    phone_model = PhoneModel.objects.get(brand=brand, name=model_name_title)
                except PhoneModel.DoesNotExist:
                    # If it doesn't exist (unlikely, but just in case), create
                    phone_model = self.create_or_get_phone_model(brand, phone_model_substring)
                product.compatible_with.add(phone_model)

        product.save()
