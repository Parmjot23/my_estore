from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, AddToCartSerializer
from shop.models import Product


class CartViewSet(viewsets.GenericViewSet):
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cart.objects.none()

    def list(self, request, *args, **kwargs):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], serializer_class=AddToCartSerializer, url_path='add')
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            quantity = serializer.validated_data.get('quantity', 1)
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({'detail': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)

            item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            if not created:
                item.quantity += quantity
            else:
                item.quantity = quantity
            item.save()
            item_serializer = CartItemSerializer(item, context={'request': request})
            return Response(item_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['put'], serializer_class=AddToCartSerializer, url_path='update/(?P<product_pk>[^/.]+)')
    def update_item(self, request, product_pk=None):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({'detail': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_pk)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)
        quantity = request.data.get('quantity')
        if quantity is None or int(quantity) < 1:
            return Response({'detail': 'Quantity must be at least 1.'}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = int(quantity)
        item.save()
        serializer = CartItemSerializer(item, context={'request': request})
        return Response(serializer.data)

    @action(detail=False, methods=['delete'], url_path='remove/(?P<product_pk>[^/.]+)')
    def remove_item(self, request, product_pk=None):
        cart = Cart.objects.filter(user=request.user).first()
        if not cart:
            return Response({'detail': 'Cart not found.'}, status=status.HTTP_404_NOT_FOUND)
        try:
            item = CartItem.objects.get(cart=cart, product_id=product_pk)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'detail': 'Item not found in cart.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_cart(self, request):
        cart = Cart.objects.filter(user=request.user).first()
        if cart:
            cart.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
