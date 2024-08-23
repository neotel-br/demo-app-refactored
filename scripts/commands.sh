#!/bin/sh
set -e

echo "Running the project"

echo "Collect Static"
python3 manage.py makemigrations rh --noinput
python3 manage.py migrate --noinput 
python3 manage.py collectstatic --noinput --clear

echo "Creating superuser..."
python manage.py shell <<EOF
from django.contrib.auth import get_user_model

User = get_user_model()
username = "admin"
password = "N3oS3nh@2021"
email = "admin@example.com"

if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username=username, email=email, password=password)
EOF

# Check if data is already populated
echo "Checking if data is already populated..."
DATA_EXISTS=$(python manage.py shell <<EOF
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
    python manage.py loaddata initial_data.json
else
    echo "Data already exists. Skipping loaddata."
fi

echo "Running Server"
gunicorn --bind 0.0.0.0:8000 demoapp.wsgi --log-file demoapp.log

