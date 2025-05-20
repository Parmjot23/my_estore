from django.contrib import admin
from .models import Review

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('product', 'user_display', 'rating', 'comment_summary', 'created_at') # 'is_approved'
    list_filter = ('rating', 'created_at', 'product__category') # 'is_approved'
    search_fields = ('product__name', 'user__username', 'user_name', 'comment')
    list_editable = ('rating',) # 'is_approved'
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('product', 'user')

    def user_display(self, obj):
        if obj.user:
            return obj.user.username
        return obj.user_name or "Guest"
    user_display.short_description = "Reviewer"

    def comment_summary(self, obj):
        return (obj.comment[:75] + '...') if len(obj.comment) > 75 else obj.comment
    comment_summary.short_description = "Comment"