# Demo App
Demo app refactored

## Requirements
- python3
- docker
- microtoken

## How to Run Project

### Set .env file
    touch .env
    
## Edit file
    SECRET_KEY=*GENERATE A SECRET KEY*
    DEBUG=TRUE
    MICROTOKEN_IP=
    MICROTOKEN_PORT=

Secret key generator: https://djecrety.ir/
    
### Run container
    cd demo-app-refactored/
    docker-compose up

Test on 0.0.0.0:8000


