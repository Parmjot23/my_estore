from decimal import Decimal
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from shop.models import Brand, Category, Product
from carts.models import CartItem


User = get_user_model()


class CartPersistenceTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="cartuser", password="pass1234")

        self.brand = Brand.objects.create(name="BrandA")
        self.category = Category.objects.create(name="Accessories")
        self.product = Product.objects.create(
            name="Widget",
            category=self.category,
            brand=self.brand,
            price=Decimal("9.99"),
        )

    def authenticate(self):
        response = self.client.post(
            "/api/accounts/token/",
            {"username": "cartuser", "password": "pass1234"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")

    def test_items_remain_after_logout_and_login(self):
        self.authenticate()

        add_resp = self.client.post(
            "/api/carts/add-item/",
            {"product_id": self.product.id, "quantity": 2},
            format="json",
        )
        self.assertEqual(add_resp.status_code, 201)

        list_resp = self.client.get("/api/carts/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data["items"]), 1)

        # remove credentials to simulate logout
        self.client.credentials()

        # authenticate again as if logging back in
        self.authenticate()

        list_resp = self.client.get("/api/carts/")
        self.assertEqual(list_resp.status_code, 200)
        self.assertEqual(len(list_resp.data["items"]), 1)
        item = list_resp.data["items"][0]
        self.assertEqual(item["product_id"], self.product.id)
        self.assertEqual(item["quantity"], 2)

        # ensure item exists in database
        cart_item = CartItem.objects.get(cart__user=self.user, product=self.product)
        self.assertEqual(cart_item.quantity, 2)
