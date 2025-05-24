from rest_framework import serializers
from .models import Testimonial


class TestimonialSerializer(serializers.ModelSerializer):
    authorImg = serializers.ImageField(source='author_image', read_only=True)
    authorName = serializers.CharField(source='author_name')
    authorRole = serializers.CharField(source='author_role', allow_blank=True)

    class Meta:
        model = Testimonial
        fields = ['id', 'user', 'authorName', 'authorRole', 'authorImg', 'review', 'created_at']
        read_only_fields = ['id', 'user', 'authorImg', 'created_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            validated_data['user'] = request.user
            if not validated_data.get('author_name'):
                validated_data['author_name'] = request.user.get_full_name() or request.user.username
            if not validated_data.get('author_image') and getattr(request.user, 'profile_image', None):
                validated_data['author_image'] = request.user.profile_image
        elif not validated_data.get('author_name'):
            raise serializers.ValidationError({'authorName': 'This field is required for guest testimonials.'})
        return super().create(validated_data)
