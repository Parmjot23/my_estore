from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
# from rest_framework_simplejwt.tokens import RefreshToken # If using JWT for auth
from django.contrib.auth import get_user_model
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    AddressSerializer,
    PasswordResetSerializer,
)
from .models import Address #, UserProfile

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserDetailView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PasswordResetView(generics.CreateAPIView):
    serializer_class = PasswordResetSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(request=request)
        return Response({"detail": "Password reset instructions sent if the email exists."})

# class UserProfileViewSet(viewsets.ModelViewSet):
#     serializer_class = UserProfileSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         # Ensure UserProfile is created if it doesn't exist for the user
#         UserProfile.objects.get_or_create(user=self.request.user)
#         return UserProfile.objects.filter(user=self.request.user)
#
#     def perform_create(self, serializer):
#         # Should ideally be handled by get_or_create in get_queryset
#         # or signal on User creation.
#         # This prevents creating multiple profiles.
#         if UserProfile.objects.filter(user=self.request.user).exists():
#             raise serializers.ValidationError("Profile already exists for this user.")
#         serializer.save(user=self.request.user)

# For JWT authentication, you'd also have views for token obtaining and refreshing
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
