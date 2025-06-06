from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

router = DefaultRouter()
router.register(r'', OrderViewSet, basename='order') # Register at root of '/orders/'

urlpatterns = [
    path('', include(router.urls)),
]