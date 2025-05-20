from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address  # , UserProfile


# class UserProfileInline(admin.StackedInline):
#     model = UserProfile
#     can_delete = False
#     verbose_name_plural = 'Profile'

class CustomUserAdmin(BaseUserAdmin):
    # inlines = (UserProfileInline,)
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')
    # Add other configurations as needed


admin.site.register(User, CustomUserAdmin)
admin.site.register(Address)
# admin.site.register(UserProfile)
