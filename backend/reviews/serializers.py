from rest_framework import serializers
from .models import Review
from accounts.serializers import UserSerializer  # To display user info, if needed


class ReviewSerializer(serializers.ModelSerializer):
    # user_details = UserSerializer(source='user', read_only=True) # Optional: if you want to nest user details

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']  # User is set based on request

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, "user") and request.user.is_authenticated:
            validated_data['user'] = request.user
            # Optionally, prefill user_name if user is authenticated and user_name is not provided
            if not validated_data.get('user_name'):
                validated_data['user_name'] = request.user.get_full_name() or request.user.username

        # Ensure user_name is provided if the user is not authenticated
        elif not validated_data.get('user_name'):
            raise serializers.ValidationError({"user_name": "This field is required for guest reviews."})

        return super().create(validated_data)