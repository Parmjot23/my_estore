# backend/backend/urls.py # Assuming 'backend' is your project_config_name

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    # API URLs
    path('api/shop/', include('shop.urls')),  # Corrected: 'shop.urls' instead of 'apps.shop.urls'
    path('api/accounts/', include('accounts.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/wishlists/', include('wishlists.urls')),
    path('api/carts/', include('carts.urls')),
    path('api/testimonials/', include('testimonials.urls')),
    path('api/organizations/', include('organizations.urls')),
    path('accounts/', include('django.contrib.auth.urls')),
    # You would add other app API urls here, e.g.:
    # path('api/users/', include('users.urls')), # If 'users' app is at the root of backend/
    # path('api/orders/', include('orders.urls')), # If 'orders' app is at the root of backend/

    # It's good practice to version your API, e.g.:
    # path('api/v1/shop/', include('shop.urls')),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)