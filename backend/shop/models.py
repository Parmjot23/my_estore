# backend/shop/models.py

from django.db import models
from django.utils.text import slugify
from django.core.exceptions import ValidationError
import os


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Brand(TimeStampedModel):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name = "Brand"
        verbose_name_plural = "Brands"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class PhoneModel(TimeStampedModel):
    brand = models.ForeignKey(Brand, related_name='phone_models', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="e.g., iPhone 15 Pro, Galaxy S24 Ultra")
    slug = models.SlugField(max_length=120, unique=True, blank=True)

    class Meta:
        verbose_name = "Phone Model"
        verbose_name_plural = "Phone Models"
        unique_together = ('brand', 'name')
        ordering = ['brand__name', 'name']

    def __str__(self):
        return f"{self.brand.name} {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.brand.name} {self.name}")
        super().save(*args, **kwargs)


class Category(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True, help_text="Unique URL-friendly identifier.")
    description = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='categories/', blank=True, null=True)
    parent = models.ForeignKey('self', null=True, blank=True, related_name='children', on_delete=models.SET_NULL)

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(TimeStampedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True, help_text="Unique URL-friendly identifier.")
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(Category, related_name='products', on_delete=models.PROTECT)
    brand = models.ForeignKey(Brand, related_name='products', on_delete=models.SET_NULL, null=True, blank=True,
                              help_text="Brand of the accessory itself, e.g., Spigen, Anker.")

    price = models.DecimalField(max_digits=10, decimal_places=2)
    discounted_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)

    sku = models.CharField(max_length=100, unique=True, blank=True, null=True)
    stock_quantity = models.PositiveIntegerField(default=10)
    is_available = models.BooleanField(default=True)

    compatible_with = models.ManyToManyField(PhoneModel, blank=True, related_name='compatible_accessories',
                                             help_text="Select phone models this accessory is compatible with.")

    color = models.CharField(max_length=50, blank=True, null=True)
    material = models.CharField(max_length=100, blank=True, null=True)
    connectivity_type = models.CharField(max_length=50, blank=True, null=True,
                                         help_text="e.g., USB-C, Lightning, Bluetooth, 3.5mm Jack")
    wattage = models.CharField(max_length=20, blank=True, null=True, help_text="e.g., 20W, 65W")

    cover_image = models.ImageField(upload_to='products/covers/', blank=True, null=True,
                                    help_text="Primary/cover image for the product.")

    reviews_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)

    is_new_arrival = models.BooleanField(default=False)
    is_best_seller = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Product (Accessory)"
        verbose_name_plural = "Products (Accessories)"
        ordering = ['-created_at', 'name']

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        original_slug = self.slug
        counter = 1
        while Product.objects.filter(slug=self.slug).exclude(pk=self.pk).exists():
            self.slug = f"{original_slug}-{counter}"
            counter += 1
        super().save(*args, **kwargs)

    @property
    def get_discount_percentage(self):
        if self.discounted_price and self.price > 0:
            return round(((self.price - self.discounted_price) / self.price) * 100)
        return 0

    @property
    def get_primary_thumbnail_url(self):
        thumbnail = self.product_media.filter(media_type=ProductMedia.IMAGE, is_thumbnail=True).order_by(
            'order').first()
        if thumbnail and thumbnail.file:
            return thumbnail.file.url
        if self.cover_image:
            return self.cover_image.url
        first_image = self.product_media.filter(media_type=ProductMedia.IMAGE).order_by('order').first()
        if first_image and first_image.file:
            return first_image.file.url
        return None

    @property
    def get_primary_preview_url(self):
        preview = self.product_media.filter(media_type=ProductMedia.IMAGE, is_preview=True).order_by('order').first()
        if preview and preview.file:
            return preview.file.url
        if self.cover_image:
            return self.cover_image.url
        first_image = self.product_media.filter(media_type=ProductMedia.IMAGE).order_by('order').first()
        if first_image and first_image.file:
            return first_image.file.url
        return None


def product_media_path(instance, filename):
    return f'products/{instance.product.slug}/{filename}'


class ProductMedia(TimeStampedModel):  # <<<--- THIS IS THE CLASS DEFINITION
    IMAGE = 'IMG'
    VIDEO = 'VID'
    MEDIA_TYPE_CHOICES = [
        (IMAGE, 'Image'),
        (VIDEO, 'Video'),
    ]

    product = models.ForeignKey(Product, related_name='product_media', on_delete=models.CASCADE)
    media_type = models.CharField(
        max_length=3,
        choices=MEDIA_TYPE_CHOICES,
        default=IMAGE,
    )
    file = models.FileField(upload_to=product_media_path, help_text="Upload an image or a video file.")
    alt_text = models.CharField(max_length=255, blank=True, null=True,
                                help_text="Descriptive text for images (for accessibility).")

    is_thumbnail = models.BooleanField(default=False, help_text="Optimized for list views, small image previews.")
    is_preview = models.BooleanField(default=False, help_text="Larger image preview for product details or quick view.")

    video_thumbnail = models.ImageField(upload_to='products/video_thumbnails/', blank=True, null=True,
                                        help_text="Optional thumbnail for video files.")

    order = models.PositiveIntegerField(default=0, help_text="Display order for media items.")

    class Meta:
        verbose_name = "Product Media"
        verbose_name_plural = "Product Media"
        ordering = ['product', 'order', 'created_at']

    def __str__(self):
        media_type_display = dict(self.MEDIA_TYPE_CHOICES).get(self.media_type, 'Media')
        return f"{media_type_display} for {self.product.name}"

    def clean(self):
        super().clean()
        if self.media_type == self.VIDEO:
            ext = os.path.splitext(self.file.name)[1].lower()
            valid_video_extensions = ['.mp4', '.mov', '.avi', '.wmv', '.mkv']
            if ext not in valid_video_extensions:
                raise ValidationError(
                    f"Unsupported video file extension: {ext}. Allowed: {', '.join(valid_video_extensions)}")
            # self.is_thumbnail = False # Consider if these flags make sense for videos
            # self.is_preview = False
        elif self.media_type == self.IMAGE:
            ext = os.path.splitext(self.file.name)[1].lower()
            valid_image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            if ext not in valid_image_extensions:
                raise ValidationError(
                    f"Unsupported image file extension: {ext}. Allowed: {', '.join(valid_image_extensions)}")
            self.video_thumbnail = None


class SlideshowItem(TimeStampedModel):
    """Model to control which products appear in the hero carousel."""

    product = models.ForeignKey(Product, related_name='slideshow_items', on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Slide: {self.product.name}"


class PromoBanner(TimeStampedModel):
    """Model for promotional banners displayed on the home page."""

    SIZE_CHOICES = [
        ('large', 'Large'),
        ('small', 'Small'),
    ]

    product = models.ForeignKey(Product, related_name='promo_banners', on_delete=models.CASCADE)
    size = models.CharField(max_length=10, choices=SIZE_CHOICES, default='small')
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"Banner: {self.product.name} ({self.size})"
