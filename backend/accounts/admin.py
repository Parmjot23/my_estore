from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import User, Address  # , UserProfile


class CustomUserCreationForm(UserCreationForm):
    """Extend the default creation form to include our extra fields."""

    class Meta(UserCreationForm.Meta):
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "company_name",
            "phone_number",
            "gst_hst_number",
            "pst_number",
        )


class CustomUserChangeForm(UserChangeForm):
    """Extend the default change form so the extra fields show up."""

    class Meta(UserChangeForm.Meta):
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "company_name",
            "phone_number",
            "gst_hst_number",
            "pst_number",
            "is_active",
            "is_staff",
            "is_superuser",
            "groups",
            "user_permissions",
        )


# class UserProfileInline(admin.StackedInline):
#     model = UserProfile
#     can_delete = False
#     verbose_name_plural = 'Profile'

class CustomUserAdmin(BaseUserAdmin):
    """Admin configuration showing all registration fields."""

    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

    # inlines = (UserProfileInline,)
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'company_name',
        'phone_number',
        'gst_hst_number',
        'pst_number',
        'is_staff',
        'is_active',
    )

    fieldsets = BaseUserAdmin.fieldsets + (
        (
            'Additional Info',
            {
                'fields': (
                    'company_name',
                    'phone_number',
                    'gst_hst_number',
                    'pst_number',
                    'profile_image',
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                'classes': ('wide',),
                'fields': (
                    'username',
                    'email',
                    'first_name',
                    'last_name',
                    'company_name',
                    'phone_number',
                    'gst_hst_number',
                    'pst_number',
                    'password1',
                    'password2',
                    'is_active',
                    'is_staff',
                    'is_superuser',
                    'groups',
                    'user_permissions',
                ),
            },
        ),
    )


admin.site.register(User, CustomUserAdmin)
admin.site.register(Address)
# admin.site.register(UserProfile)
