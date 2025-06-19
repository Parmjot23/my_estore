# apps/shop/views.py

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend # For advanced filtering
from .models import Category, Product, SlideshowItem, PromoBanner, Brand, PhoneModel
from .serializers import (
    CategorySerializer,
    ProductSerializer,
    SlideshowItemSerializer,
    PromoBannerSerializer,
    BrandSerializer,
    PhoneModelSerializer,
)
from django.db.models import Count, Q, Prefetch

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
    """API endpoint that allows categories to be viewed or edited."""

    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['name', 'parent__slug']  # Allow filtering by parent slug
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'product_count']

    def get_queryset(self):
        """Return categories annotated with product counts respecting product filters."""
        request = self.request

        product_filter = Q(products__is_available=True)
        brand_slug = request.query_params.get('brand__slug')
        if brand_slug:
            product_filter &= Q(products__brand__slug=brand_slug)

        phone_model_slug = request.query_params.get('compatible_with__slug')
        if phone_model_slug:
            product_filter &= Q(products__compatible_with__slug=phone_model_slug)

        search_query = request.query_params.get('search')
        if search_query:
            product_filter &= (
                Q(products__name__icontains=search_query)
                | Q(products__description__icontains=search_query)
                | Q(products__sku__icontains=search_query)
                | Q(products__brand__name__icontains=search_query)
                | Q(products__compatible_with__name__icontains=search_query)
            )

        min_price = request.query_params.get('price__gte')
        if min_price is not None:
            product_filter &= Q(products__price__gte=min_price)
        max_price = request.query_params.get('price__lte')
        if max_price is not None:
            product_filter &= Q(products__price__lte=max_price)

        children_qs = (
            Category.objects.annotate(
                product_count=Count("products", filter=product_filter)
            )
            .filter(product_count__gt=0)
        )

        root_categories = (
            Category.objects.filter(parent__isnull=True)
            .annotate(
                product_count=Count("products", filter=product_filter),
                child_product_count=Count(
                    "children__products", filter=product_filter
                ),
            )
            .prefetch_related(Prefetch("children", queryset=children_qs))
        )

        return root_categories.filter(
            Q(product_count__gt=0) | Q(child_product_count__gt=0)
        ).distinct()


class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows products to be viewed or edited.
    """
    queryset = Product.objects.filter(is_available=True).select_related('category')
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny] # Or IsAdminOrReadOnly for modifications
    lookup_field = 'slug'
    # Allow characters like dots, underscores, commas, plus signs and
    # parentheses in product slugs. Using a broad regex helps match the
    # imported product data which contains a variety of symbols.
    lookup_value_regex = r'[\w\-\.(),+]+'

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
        'brand__slug': ['exact'],
        'brand__name': ['exact', 'icontains'],
        'compatible_with__slug': ['exact'],
    }  # Example: /api/shop/products/?category__slug=laptops&price__gte=500
    search_fields = ['name', 'description', 'sku', 'category__name', 'brand__name', 'compatible_with__name']
    ordering_fields = ['name', 'price', 'created_at', 'average_rating']
    ordering = ['-created_at'] # Default ordering

    # To pass request context to serializer (e.g., for building absolute image URLs)
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context


class BrandViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Brand.objects.all().prefetch_related('phone_models')
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


class PhoneModelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PhoneModel.objects.select_related('brand')
    serializer_class = PhoneModelSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['brand__slug', 'brand__name']
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']


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
