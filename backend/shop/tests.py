from decimal import Decimal
from urllib.parse import quote

from django.test import TestCase
from rest_framework.test import APIClient

from shop.models import Brand, Category, Product


class ProductSlugPatternTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.brand = Brand.objects.create(name="BrandZ")
        self.category = Category.objects.create(name="Gadgets")
        self.special_slug = "case.v2_test+(2024),edition"
        self.product = Product.objects.create(
            name="Special Gadget",
            slug=self.special_slug,
            category=self.category,
            brand=self.brand,
            price=Decimal("49.99"),
        )

    def test_retrieve_product_with_special_slug(self):
        url = f"/api/shop/products/{quote(self.special_slug, safe='')}/"
        response = self.client.get(url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["slug"], self.special_slug)

