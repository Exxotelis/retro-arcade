from django.contrib import admin
from django.urls import path
from arcade import views as arcade_views
from django.views.generic import TemplateView
from django.urls import re_path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/games/', arcade_views.games_list, name='games_list'),
    path('api/games/<slug:slug>/', arcade_views.game_detail, name='game_detail'),
    path('api/highscores/', arcade_views.highscores_endpoint, name='highscores'),
    path("", TemplateView.as_view(template_name="index.html")),
    re_path(r"^(?!admin|api|static/).*$", TemplateView.as_view(template_name="index.html")),


]