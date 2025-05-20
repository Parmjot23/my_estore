from rest_framework import viewsets, permissions
from .models import Review
from .serializers import ReviewSerializer
from rest_framework.exceptions import PermissionDenied

class ProductReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Allow read for anyone, write for authenticated

    def get_queryset(self):
        product_id = self.kwargs.get('product_pk') # Assuming nested URL like /products/{product_pk}/reviews/
        if product_id:
            return Review.objects.filter(product_id=product_id).select_related('user')
        return Review.objects.none() # Or all reviews if not nested: Review.objects.all()

    def perform_create(self, serializer):
        product_id = self.kwargs.get('product_pk')
        # Check if the user has already reviewed this product (optional)
        # if Review.objects.filter(product_id=product_id, user=self.request.user).exists():
        #     raise PermissionDenied("You have already reviewed this product.")
        serializer.save(product_id=product_id, user=self.request.user if self.request.user.is_authenticated else None)

    def perform_update(self, serializer):
        review = self.get_object()
        if review.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You do not have permission to edit this review.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise PermissionDenied("You do not have permission to delete this review.")
        instance.delete()