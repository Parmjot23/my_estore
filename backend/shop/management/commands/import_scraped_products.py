import os
import json
import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from shop.models import Category, Brand, Product, ProductMedia
from reviews.models import Review  # If Review is in a separate app, import accordingly
from wishlists.models import Wishlist, WishlistItem
from orders.models import Order, OrderItem  # Change to your app name if different
from django.core.files import File
from django.utils.text import slugify

DATA_ROOT = "igen_product_images_updated"
User = get_user_model()


class Command(BaseCommand):
    help = "Imports products and adds sample data for new models"

    def handle(self, *args, **options):
        demo_users = list(User.objects.all())
        if not demo_users:
            print("❌ No users in the system. Create at least one user for demo wishlist/review/order data!")
            return

        for category_name in os.listdir(DATA_ROOT):
            category_path = os.path.join(DATA_ROOT, category_name)
            if not os.path.isdir(category_path):
                continue

            # 1. Ensure Category exists
            category, _ = Category.objects.get_or_create(
                slug=slugify(category_name),
                defaults={'name': category_name.replace('-', ' ').title()}
            )

            for filename in os.listdir(category_path):
                if not filename.endswith('.json'):
                    continue
                product_json_path = os.path.join(category_path, filename)

                with open(product_json_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # 2. Handle Brand
                brand = None
                brand_name = data.get('brand')
                if brand_name:
                    brand, _ = Brand.objects.get_or_create(
                        slug=slugify(brand_name),
                        defaults={'name': brand_name}
                    )

                # 3. Prepare Product fields
                slug = data.get('slug') or slugify(data['name'])
                # Ensure slug uniqueness
                orig_slug = slug
                i = 1
                while Product.objects.filter(slug=slug).exists():
                    slug = f"{orig_slug}-{i}"
                    i += 1

                # 4. Create Product
                product = Product.objects.create(
                    name=data['name'],
                    slug=slug,
                    description=data.get('description', ''),
                    category=category,
                    brand=brand,
                    price=data.get('price', 0.0) or 0.0,
                    sku=data.get('sku'),
                    color=data.get('color'),
                    material=data.get('material'),
                    connectivity_type=data.get('connectivity_type'),
                    wattage=data.get('wattage'),
                    stock_quantity=data.get('stock_quantity', 10),
                    is_available=data.get('is_available', True),
                )

                # 5. Attach Images (first = cover_image, others as ProductMedia)
                images = data.get('images', [])
                for idx, img_name in enumerate(images):
                    img_path = os.path.join(category_path, img_name)
                    if os.path.exists(img_path):
                        with open(img_path, 'rb') as img_file:
                            django_file = File(img_file, name=os.path.basename(img_path))
                            if idx == 0:
                                product.cover_image.save(os.path.basename(img_path), django_file, save=True)
                            else:
                                with open(img_path, 'rb') as img_file2:
                                    django_file2 = File(img_file2, name=os.path.basename(img_path))
                                    ProductMedia.objects.create(
                                        product=product,
                                        media_type=ProductMedia.IMAGE,
                                        file=django_file2,
                                        is_thumbnail=(idx == 1),
                                        is_preview=(idx == 1)
                                    )

                print(f"✅ Imported: {product.name}")

                # === DEMO: Add 1–3 random reviews per product ===
                for _ in range(random.randint(1, 3)):
                    user = random.choice(demo_users)
                    Review.objects.create(
                        product=product,
                        user=user,
                        user_name=user.username,
                        rating=random.randint(3, 5),
                        comment="This is a demo review.",
                    )

                # === DEMO: Add 1–2 wishlist entries per product for random users ===
                for _ in range(random.randint(1, 2)):
                    user = random.choice(demo_users)
                    wishlist, _ = Wishlist.objects.get_or_create(user=user)
                    WishlistItem.objects.get_or_create(wishlist=wishlist, product=product)

                # === DEMO: Add 1–2 orders containing this product ===
                for _ in range(random.randint(1, 2)):
                    user = random.choice(demo_users)
                    order = Order.objects.create(
                        user=user,
                        first_name=user.first_name or "Demo",
                        last_name=user.last_name or "User",
                        email=user.email or "demo@example.com",
                        street_address="123 Demo St",
                        postal_code="A1B2C3",
                        city="Demo City",
                        country="Canada",
                        status="DELIVERED",
                        is_paid=True,
                    )
                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        price=product.price,
                        quantity=random.randint(1, 3)
                    )

        print("🎉 All done! Products and demo data imported.")
