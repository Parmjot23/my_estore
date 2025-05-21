from rest_framework import serializers
from .models import Wishlist, WishlistItem
from shop.serializers import ProductSerializer # For nested product details

class WishlistItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = WishlistItem
        fields = ['id', 'product_id', 'product_details', 'added_at']
        read_only_fields = ['id', 'added_at', 'product_details']

class WishlistSerializer(serializers.ModelSerializer):
    items = WishlistItemSerializer(many=True, read_only=True) # Read items, manage through specific actions

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

class AddToWishlistSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=True)

    def validate_product_id(self, value):
        from shop.models import Product # Local import to avoid circular dependency if any
        if not Product.objects.filter(id=value).exists():
            raise serializers.ValidationError("Product not found.")
        return value

