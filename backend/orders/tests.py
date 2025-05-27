from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from shop.models import Brand, Category, Product
from orders.models import Order


User = get_user_model()


class OrderModelTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="orderuser", password="pass1234")

        self.brand = Brand.objects.create(name="BrandB")
        self.category = Category.objects.create(name="Gadgets")
        self.product = Product.objects.create(
            name="Gizmo",
            category=self.category,
            brand=self.brand,
            price=Decimal("20.00"),
        )

    def authenticate(self):
        response = self.client.post(
            "/api/accounts/token/",
            {"username": "orderuser", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_create_order_and_items(self):
        self.authenticate()

        order_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "street_address": "123 Street",
            "postal_code": "12345",
            "city": "Town",
            "country": "Nowhere",
            "items": [
                {"product_id": self.product.id, "price": "20.00", "quantity": 3}
            ],
        }

        response = self.client.post("/api/orders/", order_data, format="json")
        self.assertEqual(response.status_code, 201)

        order = Order.objects.get(id=response.data["id"])
        self.assertEqual(order.user, self.user)
        self.assertEqual(order.items.count(), 1)
        item = order.items.first()
        self.assertEqual(item.product, self.product)
        self.assertEqual(item.quantity, 3)
        self.assertEqual(item.price, Decimal("20.00"))

