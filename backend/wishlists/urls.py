from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WishlistViewSet

router = DefaultRouter()
# We register the viewset to handle custom actions.
# The base name is 'wishlist', actions will be wishlist-add-item, wishlist-remove-item etc.
router.register(r'', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
]