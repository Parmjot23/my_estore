from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

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

    # Potentially add custom actions like 'mark_as_paid', 'cancel_order'
    # @action(detail=True, methods=['post'])
    # def mark_as_paid(self, request, pk=None):
    #     order = self.get_object()
    #     # Logic to mark order as paid, e.g., after payment confirmation
    #     order.is_paid = True
    #     order.status = 'PROCESSING' # Or other appropriate status
    #     order.save()
    #     return Response({'status': 'order marked as paid'})
