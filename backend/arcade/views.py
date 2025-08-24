import json
from django.http import JsonResponse, HttpResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from .models import Game, HighScore


def health(request):
    return JsonResponse({"status": "ok"})



def serialize_game(g: Game):
    return {
        "id": g.id,
        "title": g.title,
        "slug": g.slug,
        "platform": g.platform,
        "year": g.year,
        "thumbnail_url": g.thumbnail_url,
        "embed_url": g.embed_url,
    }

def games_list(request):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    qs = Game.objects.filter(is_public=True).order_by("title")
    return JsonResponse({"results": [serialize_game(g) for g in qs]})

def game_detail(request, slug):
    if request.method != "GET":
        return HttpResponseNotAllowed(["GET"])
    try:
        g = Game.objects.get(slug=slug, is_public=True)
    except Game.DoesNotExist:
        return JsonResponse({"detail": "Not found"}, status=404)
    return JsonResponse(serialize_game(g))

@csrf_exempt  # προσωρινά open-mode αν κάνεις POST από άλλο origin χωρίς CSRF
def highscores_endpoint(request):
    if request.method == "GET":
        slug = request.GET.get("game")
        qs = HighScore.objects.all()
        if slug:
            qs = qs.filter(game__slug=slug)
        data = [
            {
                "game": hs.game.slug,
                "user_name": hs.user_name,
                "score": hs.score,
                "created": hs.created.isoformat(),
            }
            for hs in qs.order_by("-score")[:100]
        ]
        return JsonResponse({"results": data})

    if request.method == "POST":
        try:
            body = json.loads(request.body.decode("utf-8"))
        except Exception:
            return HttpResponseBadRequest("Invalid JSON")

        game_slug = body.get("game")
        user_name = body.get("user_name")
        score = body.get("score")

        if not (game_slug and user_name and isinstance(score, int)):
            return HttpResponseBadRequest("Missing fields: game, user_name, score(int)")

        try:
            game = Game.objects.get(slug=game_slug, is_public=True)
        except Game.DoesNotExist:
            return HttpResponseBadRequest("Invalid game")

        HighScore.objects.create(game=game, user_name=user_name, score=score)
        return JsonResponse({"ok": True})

    return HttpResponseNotAllowed(["GET", "POST"])
