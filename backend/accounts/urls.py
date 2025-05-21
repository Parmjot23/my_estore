from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, UserDetailView, AddressViewSet, PasswordResetView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView # Uncomment this

router = DefaultRouter()
router.register(r'addresses', AddressViewSet, basename='address')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('user/', UserDetailView.as_view(), name='user_detail'),
    path('password-reset/', PasswordResetView.as_view(), name='password_reset'),

    # If using JWT for token authentication:
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),   # Uncomment this
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # Uncomment this

    path('', include(router.urls)),
]
