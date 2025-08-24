from django.contrib import admin
from .models import Game, HighScore

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ('title', 'platform', 'year', 'is_public')
    prepopulated_fields = {"slug": ("title",)}

@admin.register(HighScore)
class HighScoreAdmin(admin.ModelAdmin):
    list_display = ('game', 'user_name', 'score', 'created')
    list_filter = ('game',)