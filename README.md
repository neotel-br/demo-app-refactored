# Demo App
Demo app refactored

## Requirements
- python3

## How to Run Project

### Install requirements.txt
    pip install -r requirements.txt

### Set .env file
    touch .env
    
## Edit file
    SECRET_KEY=*GENERATE A SECRET KEY*
    DEBUG=TRUE
    CTS_IP=
    CTS_PORT=

Secret key generator: https://djecrety.ir/
    
### Migrate
    python3 manage.py makemigrations rh
    python3 manage.py migrate

### Run project
    python3 manage.py runserver


