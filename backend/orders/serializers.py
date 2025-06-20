from rest_framework import serializers
from .models import Order, OrderItem
from shop.serializers import ProductSerializer  # For nested product details


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)  # Optional: for richer display
    product_id = serializers.IntegerField(write_only=True)  # For creating/updating order items

    class Meta:
        model = OrderItem
        fields = ['id', 'product_id', 'product_details', 'price', 'quantity', 'get_cost']
        read_only_fields = ['id', 'get_cost', 'product_details']


class OrderCreateFromCartSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'first_name', 'last_name', 'email',
            'street_address', 'apartment_address', 'postal_code', 'city', 'country'
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_id = serializers.IntegerField(source='user.id', read_only=True, allow_null=True)
    total_cost = serializers.DecimalField(source='get_total_cost', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user_id', 'first_name', 'last_name', 'email',
            'street_address', 'apartment_address', 'postal_code', 'city', 'country',
            'created_at', 'updated_at', 'is_paid', 'status', 'braintree_id',
            'items', 'total_cost'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user_id', 'total_cost', 'braintree_id']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            # Assuming product_id is passed for items
            OrderItem.objects.create(order=order, product_id=item_data['product_id'], price=item_data['price'],
                                     quantity=item_data['quantity'])
        return order

    def update(self, instance, validated_data):
        # Basic update, order items update might be complex and handled separately or disallowed post-creation
        instance.status = validated_data.get('status', instance.status)
        instance.is_paid = validated_data.get('is_paid', instance.is_paid)
        # Add other updatable fields
        instance.save()
        return instance