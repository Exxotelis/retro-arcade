from django.db import models

class Game(models.Model):
    title = models.CharField(max_length=120)
    slug = models.SlugField(unique=True)
    platform = models.CharField(max_length=60, help_text="e.g., MAME, NES, SNES, Flash")
    year = models.PositiveIntegerField(null=True, blank=True)
    thumbnail_url = models.URLField(blank=True)
    embed_url = models.URLField(help_text="URL to embed in an <iframe> (e.g., Internet Archive viewer)")
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class HighScore(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='scores')
    user_name = models.CharField(max_length=60)
    score = models.IntegerField()
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-score', 'created']

    def __str__(self):
        return f"{self.user_name} - {self.game.title} - {self.score}"