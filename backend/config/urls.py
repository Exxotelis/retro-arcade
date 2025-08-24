from django.urls import path, re_path
from django.views.generic import TemplateView

urlpatterns = [
    # ... τα υπάρχοντα urls σου (admin, api, κλπ.)
    path("", TemplateView.as_view(template_name="index.html")),
    # SPA fallback για οποιοδήποτε άλλο path (εκτός από api/static)
    re_path(r'^(?!api|admin|static/).*$',
            TemplateView.as_view(template_name="index.html")),
]
