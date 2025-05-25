# apps/shop/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet,
    ProductViewSet,
    SlideshowItemViewSet,
    PromoBannerViewSet,
)
from reviews.views import ProductReviewViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'categories', CategoryViewSet, basename='category')
router.register(r'products', ProductViewSet, basename='product')
router.register(r'slides', SlideshowItemViewSet, basename='slideshowitem')
router.register(r'banners', PromoBannerViewSet, basename='promobanner')

# Manual nested routes for product reviews without requiring drf-nested-routers
review_list = ProductReviewViewSet.as_view({
    'get': 'list',
    'post': 'create',
})
review_detail = ProductReviewViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy',
})

# The API URLs are now determined automatically by the router.
urlpatterns = [
    path('', include(router.urls)),
    # Nested review routes: /products/<product_pk>/reviews/
    path('products/<int:product_pk>/reviews/', review_list, name='product-reviews-list'),
    path('products/<int:product_pk>/reviews/<int:pk>/', review_detail, name='product-reviews-detail'),
]
