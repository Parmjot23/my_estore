# Generated by Django 4.2.21 on 2025-05-19 21:09

from django.db import migrations, models
import django.db.models.deletion
import shop.models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Brand',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=100, unique=True)),
                ('slug', models.SlugField(blank=True, max_length=120, unique=True)),
                ('logo', models.ImageField(blank=True, null=True, upload_to='brands/')),
                ('description', models.TextField(blank=True, null=True)),
            ],
            options={
                'verbose_name': 'Brand',
                'verbose_name_plural': 'Brands',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255, unique=True)),
                ('slug', models.SlugField(blank=True, help_text='Unique URL-friendly identifier.', max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('image', models.ImageField(blank=True, null=True, upload_to='categories/')),
                ('parent', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='shop.category')),
            ],
            options={
                'verbose_name': 'Category',
                'verbose_name_plural': 'Categories',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='PhoneModel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(help_text='e.g., iPhone 15 Pro, Galaxy S24 Ultra', max_length=100)),
                ('slug', models.SlugField(blank=True, max_length=120, unique=True)),
                ('brand', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='phone_models', to='shop.brand')),
            ],
            options={
                'verbose_name': 'Phone Model',
                'verbose_name_plural': 'Phone Models',
                'ordering': ['brand__name', 'name'],
                'unique_together': {('brand', 'name')},
            },
        ),
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('slug', models.SlugField(blank=True, help_text='Unique URL-friendly identifier.', max_length=255, unique=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('price', models.DecimalField(decimal_places=2, max_digits=10)),
                ('discounted_price', models.DecimalField(blank=True, decimal_places=2, max_digits=10, null=True)),
                ('sku', models.CharField(blank=True, max_length=100, null=True, unique=True)),
                ('stock_quantity', models.PositiveIntegerField(default=10)),
                ('is_available', models.BooleanField(default=True)),
                ('color', models.CharField(blank=True, max_length=50, null=True)),
                ('material', models.CharField(blank=True, max_length=100, null=True)),
                ('connectivity_type', models.CharField(blank=True, help_text='e.g., USB-C, Lightning, Bluetooth, 3.5mm Jack', max_length=50, null=True)),
                ('wattage', models.CharField(blank=True, help_text='e.g., 20W, 65W', max_length=20, null=True)),
                ('cover_image', models.ImageField(blank=True, help_text='Primary/cover image for the product.', null=True, upload_to='products/covers/')),
                ('reviews_count', models.PositiveIntegerField(default=0)),
                ('average_rating', models.DecimalField(decimal_places=2, default=0.0, max_digits=3)),
                ('is_new_arrival', models.BooleanField(default=False)),
                ('is_best_seller', models.BooleanField(default=False)),
                ('is_featured', models.BooleanField(default=False)),
                ('brand', models.ForeignKey(blank=True, help_text='Brand of the accessory itself, e.g., Spigen, Anker.', null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='products', to='shop.brand')),
                ('category', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='products', to='shop.category')),
                ('compatible_with', models.ManyToManyField(blank=True, help_text='Select phone models this accessory is compatible with.', related_name='compatible_accessories', to='shop.phonemodel')),
            ],
            options={
                'verbose_name': 'Product (Accessory)',
                'verbose_name_plural': 'Products (Accessories)',
                'ordering': ['-created_at', 'name'],
            },
        ),
        migrations.CreateModel(
            name='ProductMedia',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('media_type', models.CharField(choices=[('IMG', 'Image'), ('VID', 'Video')], default='IMG', max_length=3)),
                ('file', models.FileField(help_text='Upload an image or a video file.', upload_to=shop.models.product_media_path)),
                ('alt_text', models.CharField(blank=True, help_text='Descriptive text for images (for accessibility).', max_length=255, null=True)),
                ('is_thumbnail', models.BooleanField(default=False, help_text='Optimized for list views, small image previews.')),
                ('is_preview', models.BooleanField(default=False, help_text='Larger image preview for product details or quick view.')),
                ('video_thumbnail', models.ImageField(blank=True, help_text='Optional thumbnail for video files.', null=True, upload_to='products/video_thumbnails/')),
                ('order', models.PositiveIntegerField(default=0, help_text='Display order for media items.')),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='product_media', to='shop.product')),
            ],
            options={
                'verbose_name': 'Product Media',
                'verbose_name_plural': 'Product Media',
                'ordering': ['product', 'order', 'created_at'],
            },
        ),
    ]
