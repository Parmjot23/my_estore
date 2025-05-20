# This app's URLs are typically nested under products in the main urls.py
# So, this file might not be strictly necessary if you define nested routes directly
# in the shop app's urls.py or the project's main urls.py.

# However, if you want to keep it separate:
from django.urls import path, include
from rest_framework_nested import routers # Using drf-nested-routers
from .views import ProductReviewViewSet

# This router would be registered within a product's router in the main URL config
# e.g., /api/shop/products/{product_pk}/reviews/
# router = routers.SimpleRouter() # Or DefaultRouter
# router.register(r'', ProductReviewViewSet, basename='product-review')

# urlpatterns = [
#     path('', include(router.urls)),
# ]

# For simplicity if not using drf-nested-routers immediately,
# you might define these routes manually in your project or shop urls.py like:
# path('products/<int:product_pk>/reviews/', ProductReviewViewSet.as_view({'get': 'list', 'post': 'create'})),
# path('products/<int:product_pk>/reviews/<int:pk>/', ProductReviewViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'})),

# For now, let's assume it will be handled by drf-nested-routers in the project's main urls.py
# or the shop app's urls.py. If you create this file, ensure it's included appropriately.
urlpatterns = [] # Placeholder if using nested routing elsewhere