#!/bin/sh
set -e

echo "Running the project"

echo "Collect Static"
python3 manage.py makemigrations rh --noinput
python3 manage.py migrate --noinput 
python3 manage.py collectstatic --noinput --clear

echo "Running Server"
gunicorn --bind 0.0.0.0:8000 demoapp.wsgi --log-file demoapp.log
