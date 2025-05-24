from django.db import models
from django.conf import settings


class Testimonial(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='testimonials', on_delete=models.SET_NULL, null=True, blank=True)
    author_name = models.CharField(max_length=100, blank=True)
    author_role = models.CharField(max_length=100, blank=True)
    author_image = models.ImageField(upload_to='testimonials/', blank=True, null=True)
    review = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Testimonial by {self.author_name or (self.user.username if self.user else 'Guest')}"
