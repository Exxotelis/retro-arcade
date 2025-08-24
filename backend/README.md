# Retro Arcade Demo – Backend (Django)

## Quickstart (local)
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fixtures/games.json
python manage.py runserver 0.0.0.0:8000
```

Endpoints:
- `GET /api/games/`
- `GET /api/games/<slug>/`
- `GET /api/highscores/?game=<slug>`
- `POST /api/highscores/` with JSON: `{"game":"pacman-ia","user_name":"Lefty","score":12345}`

> Σημείωση: Τα `embed_url` είναι από Internet Archive/Ruffle demo και παίζουν σε `<iframe>` στο frontend.