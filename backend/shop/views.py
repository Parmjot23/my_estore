# apps/shop/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend # For advanced filtering
from .models import Category, Product, SlideshowItem, PromoBanner
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    SlideshowItemSerializer,
    PromoBannerSerializer,
)
from django.db.models import Count

# Optional: Custom permissions (e.g., IsAdminOrReadOnly)
# class IsAdminOrReadOnly(permissions.BasePermission):
#     """
#     Custom permission to only allow admin users to edit objects.
#     Read-only for everyone else.
#     """
#     def has_permission(self, request, view):
#         if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
#             return True
#         return request.user and request.user.is_staff


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows categories to be viewed or edited.
    """
    # Annotate the queryset to include product_count
    queryset = Category.objects.annotate(product_count=Count('products')).filter(parent__isnull=True).prefetch_related('children')
    # Or if you want all categories with counts:
    # queryset = Category.objects.annotate(product_count=Count('products')).all().prefetch_related('children')
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'parent__slug'] # Allow filtering by parent slug
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'product_count'] # Allow ordering by product_count


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    """
    queryset = Product.objects.filter(is_available=True).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny] # Or IsAdminOrReadOnly for modifications
    lookup_field = 'slug'

    # Filtering, Searching, Ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'category__slug': ['exact'],
        'category__name': ['exact', 'icontains'],
        'price': ['gte', 'lte', 'exact'],
        'name': ['icontains'],
        'is_available': ['exact'],
        'is_new_arrival': ['exact'],
        'is_best_seller': ['exact'],
    }  # Example: /api/shop/products/?category__slug=laptops&price__gte=500
    search_fields = ['name', 'description', 'sku', 'category__name'] # Example: /api/shop/products/?search=apple
    ordering_fields = ['name', 'price', 'created_at', 'average_rating']
    ordering = ['-created_at'] # Default ordering

    # To pass request context to serializer (e.g., for building absolute image URLs)
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class SlideshowItemViewSet(viewsets.ModelViewSet):
    """API endpoint for hero carousel items."""

    queryset = SlideshowItem.objects.filter(is_active=True).select_related('product')
    serializer_class = SlideshowItemSerializer
    permission_classes = [permissions.AllowAny]
    ordering = ['order', 'created_at']


class PromoBannerViewSet(viewsets.ModelViewSet):
    """API endpoint for promotional banners."""

    queryset = PromoBanner.objects.filter(is_active=True).select_related('product')
    serializer_class = PromoBannerSerializer
    permission_classes = [permissions.AllowAny]
    ordering = ['order', 'created_at']
