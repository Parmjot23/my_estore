from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderCreateFromCartSerializer
from carts.models import Cart

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated] # Or custom permission

    def get_queryset(self):
        user = self.request.user
        if user.is_staff: # Admins can see all orders
            return Order.objects.all().prefetch_related('items__product')
        return Order.objects.filter(user=user).prefetch_related('items__product')

    def perform_create(self, serializer):
        # Associate order with the logged-in user if not anonymous
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save() # For guest checkouts, user will be null

    @action(detail=False, methods=['post'], serializer_class=OrderCreateFromCartSerializer)
    def from_cart(self, request):
        """Create an order using the authenticated user's cart items."""
        user = request.user
        if not user.is_authenticated:
            return Response({'detail': 'Authentication required.'}, status=status.HTTP_401_UNAUTHORIZED)

        cart = Cart.objects.filter(user=user).prefetch_related('items__product').first()
        if not cart or not cart.items.exists():
            return Response({'detail': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order = Order.objects.create(user=user, **serializer.validated_data)
        for item in cart.items.all():
            product = item.product
            price = product.discounted_price if product.discounted_price else product.price
            OrderItem.objects.create(
                order=order,
                product=product,
                price=price,
                quantity=item.quantity,
            )

        cart.items.all().delete()

        response_serializer = OrderSerializer(order, context={'request': request})
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    # Potentially add custom actions like 'mark_as_paid', 'cancel_order'
    # @action(detail=True, methods=['post'])
    # def mark_as_paid(self, request, pk=None):
    #     order = self.get_object()
    #     # Logic to mark order as paid, e.g., after payment confirmation
    #     order.is_paid = True
    #     order.status = 'PROCESSING' # Or other appropriate status
    #     order.save()
    #     return Response({'status': 'order marked as paid'})
