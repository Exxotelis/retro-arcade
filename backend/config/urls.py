from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("arcade.urls")),  # τα API endpoints σου

    # SPA index για root...
    path("", TemplateView.as_view(template_name="index.html")),
    # ...και fallback για οποιοδήποτε άλλο path εκτός από admin/api/static/media
    re_path(r"^(?!(admin|api|static/|media/|favicon\.ico|robots\.txt)).*$",
            TemplateView.as_view(template_name="index.html")),
]
