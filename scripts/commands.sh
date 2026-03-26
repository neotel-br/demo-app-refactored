#!/bin/sh
set -e

echo "Running the project"

mkdir -p /demoapp/data /demoapp/static

echo "Applying migrations and collecting static files"
python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput --clear

if [ -n "$DJANGO_SUPERUSER_USERNAME" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
echo "Ensuring superuser exists..."
python3 manage.py shell <<EOF
from django.contrib.auth import get_user_model

User = get_user_model()
username = "$DJANGO_SUPERUSER_USERNAME"
password = "$DJANGO_SUPERUSER_PASSWORD"
email = "admin@example.com"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
EOF
else
echo "Skipping superuser creation because DJANGO_SUPERUSER_USERNAME or DJANGO_SUPERUSER_PASSWORD is empty."
fi

# Check if data is already populated
echo "Checking if data is already populated..."
DATA_EXISTS=$(python3 manage.py shell <<EOF
from rh.models import Employee

if Employee.objects.exists():
    print("yes")
else:
    print("no")
EOF
)

# Populate the database if no data exists
if [ "$DATA_EXISTS" = "no" ]; then
    echo "Populating the database..."
    python3 manage.py loaddata initial_data.json
else
    echo "Data already exists. Skipping loaddata."
fi

echo "Running Server"
exec gunicorn --bind 0.0.0.0:8000 demoapp.wsgi:application --access-logfile - --error-logfile -
