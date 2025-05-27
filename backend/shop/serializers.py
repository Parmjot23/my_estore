# backend/shop/serializers.py

from rest_framework import serializers
from .models import (
    Brand,
    PhoneModel,
    Category,
    Product,
    ProductMedia,
    SlideshowItem,
    PromoBanner,
)


class PhoneModelSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)

    class Meta:
        model = PhoneModel
        fields = ['id', 'name', 'slug', 'brand', 'brand_name']
        read_only_fields = ['id', 'slug', 'brand_name']


class BrandSerializer(serializers.ModelSerializer):
    phone_models = PhoneModelSerializer(many=True, read_only=True)

    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'phone_models']
        read_only_fields = ['id', 'slug']


class ProductMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    video_thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = ProductMedia
        fields = [
            'id',
            'product',
            'media_type',
            'file',
            'file_url',
            'alt_text',
            'is_thumbnail',
            'is_preview',
            'video_thumbnail',
            'video_thumbnail_url',
            'order'
        ]
        read_only_fields = ['id', 'file_url', 'video_thumbnail_url']

    def get_file_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        elif obj.file:
            return obj.file.url
        return None

    def get_video_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.video_thumbnail and request:
            return request.build_absolute_uri(obj.video_thumbnail.url)
        elif obj.video_thumbnail:
            return obj.video_thumbnail.url
        return None


class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class CategorySerializer(serializers.ModelSerializer):
    parent_slug = serializers.SlugRelatedField(slug_field='slug', source='parent', read_only=True)
    children = serializers.SerializerMethodField()
    image_url = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'description', 'image', 'image_url',
            'parent', 'parent_slug', 'children', 'product_count', # Ensure product_count is here
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'slug', 'parent_slug', 'children', 'created_at', 'updated_at', 'image_url', 'product_count']

    def get_children(self, obj):
        # Ensure children are also serialized with product_count if needed recursively
        children_queryset = obj.children.all() # .annotate(product_count=Count('products')) # If you want count for children too
        return CategorySerializer(children_queryset, many=True, context=self.context).data

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        elif obj.image:
            return obj.image.url
        return None

    def get_product_count(self, obj):
        return getattr(obj, "product_count", 0)


class ProductSerializer(serializers.ModelSerializer):
    category_details = CategorySerializer(source='category', read_only=True)
    brand_details = BrandSerializer(source='brand', read_only=True)
    compatible_phone_models = PhoneModelSerializer(source='compatible_with', many=True, read_only=True)

    # Corrected: Removed redundant source='product_media'
    product_media = ProductMediaSerializer(many=True, read_only=True)

    imgs = serializers.SerializerMethodField()
    reviews = serializers.IntegerField(source='reviews_count', read_only=True)
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'category',
            'category_details',
            'brand',
            'brand_details',
            'price',
            'discounted_price',
            'get_discount_percentage',
            'sku',
            'stock_quantity',
            'is_available',
            'compatible_with',
            'compatible_phone_models',
            'color',
            'material',
            'connectivity_type',
            'wattage',
            'cover_image',
            'cover_image_url',
            'product_media',  # Field name matches the related_name on ProductMedia model
            'imgs',
            'reviews',
            'average_rating',
            'is_new_arrival',
            'is_best_seller',
            'is_featured',
            'created_at',
            'updated_at'
        ]
        read_only_fields = [
            'id', 'slug', 'get_discount_percentage', 'created_at', 'updated_at',
            'category_details', 'brand_details', 'compatible_phone_models',
            'product_media', 'imgs', 'reviews', 'average_rating', 'cover_image_url'
        ]

    def get_cover_image_url(self, obj):
        request = self.context.get('request')
        if obj.cover_image and request:
            return request.build_absolute_uri(obj.cover_image.url)
        elif obj.cover_image:
            return obj.cover_image.url
        return None

    def get_imgs(self, obj):
        request = self.context.get('request')
        thumbnails = []
        previews = []

        # Accessing product_media through the related_name from Product model
        thumbnail_media_items = obj.product_media.filter(media_type=ProductMedia.IMAGE, is_thumbnail=True).order_by(
            'order')
        preview_media_items = obj.product_media.filter(media_type=ProductMedia.IMAGE, is_preview=True).order_by('order')

        for media_obj in thumbnail_media_items:
            if media_obj.file:
                thumbnails.append(request.build_absolute_uri(media_obj.file.url) if request else media_obj.file.url)

        for media_obj in preview_media_items:
            if media_obj.file:
                previews.append(request.build_absolute_uri(media_obj.file.url) if request else media_obj.file.url)

        if not thumbnails and obj.cover_image:
            thumbnails.append(request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url)
        if not previews and obj.cover_image:
            previews.append(request.build_absolute_uri(obj.cover_image.url) if request else obj.cover_image.url)

        all_image_media = obj.product_media.filter(media_type=ProductMedia.IMAGE).order_by('order')
        if not previews and all_image_media.exists():
            first_gallery_image = all_image_media.first()
            if first_gallery_image and first_gallery_image.file:
                url = request.build_absolute_uri(
                    first_gallery_image.file.url) if request else first_gallery_image.file.url
                previews.append(url)
        if not thumbnails and all_image_media.exists():
            first_gallery_image = all_image_media.first()
            if first_gallery_image and first_gallery_image.file:
                url = request.build_absolute_uri(
                    first_gallery_image.file.url) if request else first_gallery_image.file.url
                thumbnails.append(url)

        return {'thumbnails': thumbnails, 'previews': previews}

    def create(self, validated_data):
        compatible_with_data = validated_data.pop('compatible_with', None)
        product = Product.objects.create(**validated_data)
        if compatible_with_data:
            product.compatible_with.set(compatible_with_data)
        return product

    def update(self, instance, validated_data):
        compatible_with_data = validated_data.pop('compatible_with', None)
        instance = super().update(instance, validated_data)
        if compatible_with_data is not None:
            instance.compatible_with.set(compatible_with_data)
        return instance


class SlideshowItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = SlideshowItem
        fields = [
            'id',
            'product',
            'product_details',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'product_details', 'created_at', 'updated_at']


class PromoBannerSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = PromoBanner
        fields = [
            'id',
            'product',
            'product_details',
            'size',
            'order',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'product_details', 'created_at', 'updated_at']
