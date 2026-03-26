# Demo App
Demo app refactored

## Requirements
- python3
- docker
- microtoken

## Blank Deploy

This flow is for a fresh deployment with no existing database or static volume.

### Create `.env`
    cp .env.example .env

### Edit `.env`
    DJANGO_SUPERUSER_USERNAME=""
    DJANGO_SUPERUSER_PASSWORD=""
    SECRET_KEY="<GENERATE A SECRET KEY>"
    DEBUG=false
    ALLOWED_HOSTS=localhost,127.0.0.1
    MICROTOKEN_HOST=""
    MICROTOKEN_PORT="8001"

Secret key generator: https://djecrety.ir/

### Start the application
    docker compose up --build

On the first boot, the container will:

- apply tracked Django migrations
- collect static files
- create the configured superuser if credentials are set
- try to load `initial_data.json` only when the database is empty, without failing the deploy if seed loading breaks

Open `http://127.0.0.1:8000`.

## First Deploy Notes

- `MICROTOKEN_HOST` should point to the Microtoken service reachable by this container.
- The SQLite database is always stored at `/demoapp/data/db.sqlite3` inside the container.
- That database path is persisted by the Docker volume `demoapp_data`.
- Static files are stored in the Docker volume `demoapp_static`.
- If the database volume is empty, seed data is loaded automatically.
- If the database volume already exists, startup keeps the current data and only runs migrations.
- The deploy uses committed Django migrations. It does not generate migrations during container startup.

## Reset To Blank State

If you want to redeploy from a completely empty state, remove the existing volumes first:

    docker compose down -v
    docker compose up --build

## Environment variables

`MICROTOKEN_HOST` is the canonical variable for the Microtoken service host.
For backward compatibility, the app still accepts `MICROTOKEN_IP` and `IP`, in that order, if `MICROTOKEN_HOST` is not set.
