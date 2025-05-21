from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordResetForm
from .models import Address  # , UserProfile

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'is_staff') # Add other fields as needed
        read_only_fields = ('is_staff',)

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label="Confirm password", style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': False},
            'last_name': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',) # User will be set from request


class PasswordResetSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        User = get_user_model()
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("No user is associated with this email address.")
        return value

    def save(self, request=None):
        form = PasswordResetForm({"email": self.validated_data["email"]})
        if form.is_valid():
            form.save(request=request, use_https=request.is_secure() if request else False,
                      email_template_name="registration/password_reset_email.html")
        return True

# class UserProfileSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = UserProfile
#         fields = '__all__'
#         read_only_fields = ('user',)
