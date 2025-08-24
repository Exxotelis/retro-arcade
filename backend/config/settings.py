# settings.py — OPEN MODE (frontend σε άλλο domain, backend API μόνο)
import os
from pathlib import Path

from django.conf import settings

# ---------- Paths ----------
BASE_DIR = Path(__file__).resolve().parent.parent



# ---------- Core (OPEN defaults for now) ----------
SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-unsafe")
DEBUG = True

# Αφήνουμε ανοιχτά τώρα (θα το κλειδώσουμε μετά με envs)
ALLOWED_HOSTS = ["*"]

# CORS/CSRF — OPEN τώρα (χωρίς λίστες). Θα μπουν συγκεκριμένα origins αργότερα.
CORS_ALLOW_ALL_ORIGINS = ("CORS_ALLOW_ALL_ORIGINS", True)
CORS_ALLOWED_ORIGINS = ("CORS_ALLOWED_ORIGINS", "")
CORS_ALLOW_CREDENTIALS = ("CORS_ALLOW_CREDENTIALS", False)
CSRF_TRUSTED_ORIGINS = ("CSRF_TRUSTED_ORIGINS", "")

# Ασφάλεια (προσωρινά χαλαρά — θα τα ενεργοποιήσουμε όταν σταθεροποιηθεί)
SECURE_SSL_REDIRECT = ("DJANGO_SECURE_SSL_REDIRECT", False)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = SECURE_SSL_REDIRECT or ("SESSION_COOKIE_SECURE", False)
CSRF_COOKIE_SECURE   = SECURE_SSL_REDIRECT or ("CSRF_COOKIE_SECURE", False)
X_FRAME_OPTIONS = os.environ.get(
    "DJANGO_X_FRAME_OPTIONS",
    "ALLOWALL" if DEBUG else "SAMEORIGIN"
)

# ---------- Apps ----------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # δικό μας app με τα endpoints
    "arcade",

    # CORS για διαφορετικό origin (frontend)
    "corsheaders",
]

# ---------- Middleware ----------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",   # static σε production

    # CORS πολύ ψηλά, πριν το CommonMiddleware
    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ---------- URLs / WSGI ----------
# Σιγουρέψου ότι το πακέτο project είναι "config" (config/urls.py, config/wsgi.py)
ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

# ---------- Templates (δεν σερβίρουμε SPA από εδώ, αλλά κρατάμε τον φάκελο διαθέσιμο) ----------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # προαιρετικό, δεν χρησιμοποιείται τώρα
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ---------- Database (SQLite by default) ----------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# ---------- Password validation ----------
AUTH_PASSWORD_VALIDATORS = []

# ---------- I18N ----------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ---------- Static / WhiteNoise ----------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedStaticFilesStorage"

if settings.DEBUG:  # μόνο σε development
    FRONTEND_DIST = (BASE_DIR.parent / 'frontend' / 'dist').resolve()
    print(">> FRONTEND_DIST =", FRONTEND_DIST)  # προσωρινό debug
    STATICFILES_DIRS = [FRONTEND_DIST]
else:
    STATICFILES_DIRS = [BASE_DIR / 'static'] 

MEDIA_URL = "/media/"
MEDIA_ROOT = os.getenv("MEDIA_ROOT", BASE_DIR / "media")

# ---------- Defaults ----------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
X_FRAME_OPTIONS = "DENY"
SECURE_REFERRER_POLICY = "same-origin"