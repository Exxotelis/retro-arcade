from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("arcade/", include("arcade.urls")),
    path("", TemplateView.as_view(template_name="index.html")),
    re_path(r"^(?!api/)(?!static/)(?!media/).*$", TemplateView.as_view(template_name="index.html")),
]
