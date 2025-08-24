from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health, name="health"),
    path("games/", views.games_list, name="games_list"),
    path("games/<slug:slug>/", views.game_detail, name="game_detail"),
    path("highscores/", views.highscores_endpoint, name="highscores"),
]
