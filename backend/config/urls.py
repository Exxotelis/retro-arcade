from django.urls import path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    path("", TemplateView.as_view(template_name="index.html")),
    re_path(r"^(?!admin|api|static/).*$", TemplateView.as_view(template_name="index.html")),
]