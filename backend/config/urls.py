from django.contrib import admin
from django.urls import path
from arcade import views as arcade_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/games/', arcade_views.games_list, name='games_list'),
    path('api/games/<slug:slug>/', arcade_views.game_detail, name='game_detail'),
    path('api/highscores/', arcade_views.highscores_endpoint, name='highscores'),
]
