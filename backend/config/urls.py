from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    # Όλα τα API endpoints κάτω από /api/
    path("api/", include("arcade.urls")),
]
