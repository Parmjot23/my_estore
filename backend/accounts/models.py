from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission # Import Group and Permission
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)

    # Add or change related_name for groups and user_permissions
    # to avoid clashes with the default auth.User model.
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_(
            'The groups this user belongs to. A user will get all permissions '
            'granted to each of their groups.'
        ),
        related_name="accounts_user_groups",  # Unique related_name
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name="accounts_user_permissions",  # Unique related_name
        related_query_name="user",
    )

    # USERNAME_FIELD = 'email' # If you want to use email as the primary identifier
    # REQUIRED_FIELDS = ['username'] # Adjust if USERNAME_FIELD is changed

    def __str__(self):
        return self.username

class Address(models.Model):
    user = models.ForeignKey(User, related_name='addresses', on_delete=models.CASCADE)
    street_address = models.CharField(max_length=255)
    apartment_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100)
    state_province = models.CharField(max_length=100, blank=True, null=True)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    address_type = models.CharField(max_length=10, choices=[('BILLING', 'Billing'), ('SHIPPING', 'Shipping')])
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Addresses"
        ordering = ['-is_default', '-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.street_address}, {self.city} ({self.address_type})"