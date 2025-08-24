# Retro Arcade Demo (Django API + React/Vite Frontend)

A minimal full-stack demo for a browser-playable vintage arcade site.

## Local run
Backend:
```bash
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py loaddata fixtures/games.json
python manage.py runserver 0.0.0.0:8000
```
Frontend (in another terminal):
```bash
cd frontend
npm i
npm run dev
```
If your frontend runs on http://localhost:5173 and backend on http://localhost:8000, you may need to proxy or enable CORS via your reverse-proxy.
For quick dev, change API base on frontend:
```
echo "VITE_API_BASE=http://localhost:8000" > frontend/.env
```

## Deploy on Railway (one approach)
- Deploy **backend** as a web service using `Procfile` (gunicorn), set envs:
  - `DJANGO_SECRET_KEY` (random long string)
  - `DJANGO_DEBUG=0`
  - `DJANGO_ALLOWED_HOSTS=your-app.up.railway.app`
- Deploy **frontend** as static build with a separate Railway service or via any static host. Set `VITE_API_BASE` to your backend URL.

> Legal note: Emulators are generally legal, but commercial ROMs are not. The included sample games are **embedded** from public Internet Archive pages or public demos.