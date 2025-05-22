from django.urls import path
from .views import ProjectListAPIView, ContactMessageCreateAPIView

urlpatterns = [
    path('projects/', ProjectListAPIView.as_view(), name='project-list'),
    path('contact/', ContactMessageCreateAPIView.as_view(), name='contact'),
]
