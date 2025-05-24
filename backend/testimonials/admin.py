from django.contrib import admin
from .models import Testimonial

@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_role', 'created_at')
    search_fields = ('author_name', 'review')
    readonly_fields = ('created_at', 'updated_at')
