from django.db import migrations, models
import django.db.models.deletion

class Migration(migrations.Migration):

    dependencies = [
        ('shop', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='SlideshowItem',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='slideshow_items', to='shop.product')),
            ],
            options={
                'ordering': ['order', 'created_at'],
            },
        ),
        migrations.CreateModel(
            name='PromoBanner',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('size', models.CharField(choices=[('large', 'Large'), ('small', 'Small')], default='small', max_length=10)),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_active', models.BooleanField(default=True)),
                ('product', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='promo_banners', to='shop.product')),
            ],
            options={
                'ordering': ['order', 'created_at'],
            },
        ),
    ]
