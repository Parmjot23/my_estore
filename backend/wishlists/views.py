from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Wishlist, WishlistItem
from .serializers import WishlistSerializer, WishlistItemSerializer, AddToWishlistSerializer
from shop.models import Product


class WishlistViewSet(viewsets.GenericViewSet):  # Not ModelViewSet as we manage it uniquely per user
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Should not be called directly for list/retrieve on the ViewSet itself
        # We always operate on the user's specific wishlist.
        return Wishlist.objects.none()

    def list(self, request, *args, **kwargs):
        """Retrieve the current user's wishlist."""
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(wishlist)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], serializer_class=AddToWishlistSerializer, url_path='add-item')
    def add_item(self, request):
        """Add a product to the user's wishlist."""
        wishlist, _ = Wishlist.objects.get_or_create(user=request.user)
        serializer = AddToWishlistSerializer(data=request.data)
        if serializer.is_valid():
            product_id = serializer.validated_data['product_id']
            try:
                product = Product.objects.get(id=product_id)
            except Product.DoesNotExist:
                return Response({"detail": "Product not found."}, status=status.HTTP_404_NOT_FOUND)

            # Check if item already exists
            if WishlistItem.objects.filter(wishlist=wishlist, product=product).exists():
                return Response({"detail": "Product already in wishlist."}, status=status.HTTP_400_BAD_REQUEST)

            wishlist_item = WishlistItem.objects.create(wishlist=wishlist, product=product)
            # Serialize the created item or the whole wishlist
            item_serializer = WishlistItemSerializer(wishlist_item, context={'request': request})
            return Response(item_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'], url_path='remove-item/(?P<product_pk>[^/.]+)')
    def remove_item(self, request, product_pk=None):
        """Remove a product from the user's wishlist."""
        wishlist = Wishlist.objects.filter(user=request.user).first()
        if not wishlist:
            return Response({"detail": "Wishlist not found."}, status=status.HTTP_404_NOT_FOUND)

        try:
            item_to_remove = WishlistItem.objects.get(wishlist=wishlist, product_id=product_pk)
            item_to_remove.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WishlistItem.DoesNotExist:
            return Response({"detail": "Item not found in wishlist."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_wishlist(self, request):
        """Clear all items from the user's wishlist."""
        wishlist = Wishlist.objects.filter(user=request.user).first()
        if wishlist:
            wishlist.items.all().delete()
        return Response(status=status.HTTP_204_NO_CONTENT)