from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

urlpatterns = [
    path("admin/", admin.site.urls),
    # Όλα τα API endpoints κάτω από /api/
    path("api/", include("arcade.urls")),
    path("", RedirectView.as_view(url="https://dynamitis.com/", permanent=False)),
]

