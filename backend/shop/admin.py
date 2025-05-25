from django.contrib import admin
from .models import (
    Brand,
    PhoneModel,
    Category,
    Product,
    ProductMedia,
    SlideshowItem,
    PromoBanner,
)


class ProductMediaInline(admin.TabularInline):
    model = ProductMedia  # Changed ProductImage to ProductMedia
    extra = 1  # Show 1 extra empty form for adding media
    fields = ('media_type', 'file', 'video_thumbnail', 'alt_text', 'is_thumbnail', 'is_preview', 'order')
    readonly_fields = ('created_at', 'updated_at')
    # For a more compact view, you could use fieldsets here as well if needed


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'created_at', 'updated_at')
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('created_at',)


@admin.register(PhoneModel)
class PhoneModelAdmin(admin.ModelAdmin):
    list_display = ('name', 'brand', 'slug', 'created_at')
    search_fields = ('name', 'brand__name')
    # prepopulated_fields = {'slug': ('brand', 'name',)} # Slug is auto-generated in model
    list_filter = ('brand', 'created_at')
    list_select_related = ('brand',)  # Optimize query for brand name display


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'parent', 'image_display', 'created_at')  # Added image_display
    search_fields = ('name', 'description')
    # prepopulated_fields = {'slug': ('name',)} # Slug is auto-generated in model
    list_filter = ('parent', 'created_at')
    list_select_related = ('parent',)  # Optimize query for parent name display

    def image_display(self, obj):
        from django.utils.html import format_html
        if obj.image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.image.url)
        return "No Image"

    image_display.short_description = "Image"


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'category',
        'brand',
        'price',
        'discounted_price',
        'stock_quantity',
        'is_available',
        'is_new_arrival',
        'is_best_seller',
        'slug',
        'cover_image_display',  # Added cover_image_display
        'created_at'
    )
    list_filter = (
        'is_available',
        'is_new_arrival',
        'is_best_seller',
        'category',
        'brand',
        'created_at',
        'compatible_with__brand'
    )
    search_fields = ('name', 'slug', 'description', 'sku', 'category__name', 'brand__name')
    # prepopulated_fields = {'slug': ('name',)} # Slug is auto-generated in model
    list_editable = ('price', 'stock_quantity', 'is_available', 'is_new_arrival', 'is_best_seller')

    filter_horizontal = ('compatible_with',)

    inlines = [ProductMediaInline]

    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'category', 'brand', 'cover_image')
        }),
        ('Pricing & Stock', {
            'fields': ('price', 'discounted_price', 'sku', 'stock_quantity', 'is_available')
        }),
        ('Compatibility & Attributes', {
            'fields': ('compatible_with', 'color', 'material', 'connectivity_type', 'wattage')
        }),
        ('Flags & Metadata', {
            'fields': ('is_new_arrival', 'is_best_seller', 'is_featured', 'reviews_count', 'average_rating',
                       'get_discount_percentage')
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'get_discount_percentage')

    def cover_image_display(self, obj):
        from django.utils.html import format_html
        if obj.cover_image:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />',
                               obj.cover_image.url)
        return "No Cover Image"

    cover_image_display.short_description = "Cover"


@admin.register(ProductMedia)  # Changed ProductImage to ProductMedia
class ProductMediaAdmin(admin.ModelAdmin):
    list_display = (
    'product_name', 'media_type', 'file_display', 'video_thumbnail_display', 'is_thumbnail', 'is_preview', 'order',
    'created_at')
    list_filter = ('media_type', 'is_thumbnail', 'is_preview', 'product__category', 'product__brand')
    search_fields = ('product__name', 'alt_text')
    list_editable = ('order', 'is_thumbnail', 'is_preview')
    list_select_related = ('product',)  # Optimize query for product name display
    readonly_fields = ('created_at', 'updated_at')
    autocomplete_fields = ['product']  # Makes selecting product easier if you have many

    def product_name(self, obj):
        return obj.product.name

    product_name.short_description = "Product"
    product_name.admin_order_field = 'product__name'

    def file_display(self, obj):
        from django.utils.html import format_html
        if obj.file:
            if obj.media_type == ProductMedia.IMAGE:  # Changed ProductImage to ProductMedia
                return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />', obj.file.url)
            elif obj.media_type == ProductMedia.VIDEO:  # Changed ProductImage to ProductMedia
                return format_html('<a href="{}" target="_blank">View Video</a> (Requires player)', obj.file.url)
        return "No File"

    file_display.short_description = "Media File"

    def video_thumbnail_display(self, obj):
        from django.utils.html import format_html
        if obj.video_thumbnail:
            return format_html('<img src="{}" width="50" height="50" style="object-fit: cover;" />',
                               obj.video_thumbnail.url)
        return "N/A"

    video_thumbnail_display.short_description = "Video Thumbnail"

    def get_queryset(self, request):
        # Optimize queries by prefetching related product data
        return super().get_queryset(request).select_related('product')


@admin.register(SlideshowItem)
class SlideshowItemAdmin(admin.ModelAdmin):
    list_display = ('product', 'order', 'is_active', 'created_at')
    list_editable = ('order', 'is_active')
    list_select_related = ('product',)


@admin.register(PromoBanner)
class PromoBannerAdmin(admin.ModelAdmin):
    list_display = ('product', 'size', 'order', 'is_active', 'created_at')
    list_editable = ('size', 'order', 'is_active')
    list_select_related = ('product',)
