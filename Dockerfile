FROM python:3.11.4-alpine3.17

RUN apk add --no-cache --upgrade bash

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONBUFFERED 1

EXPOSE 8000

COPY requirements.txt /demoapp/requirements.txt
COPY /demoapp ./demoapp
COPY /scripts/ ./scripts

WORKDIR /demoapp

RUN python -m venv /venv

ENV PATH="/scripts:/venv/bin:$PATH"

RUN pip install --upgrade pip && \
 pip install -r requirements.txt && \
 pip install gunicorn && \
 mkdir -p /demoapp/demoapp/static && \
 mkdir -p /demoapp/demoapp/static/rh && \
 chmod -R 755 /demoapp/demoapp/static/rh && \
 chmod -R 755 /demoapp/demoapp/static && \
 chmod -R +x /scripts/

# USER tsurei

CMD ["/bin/sh", "/scripts/commands.sh"]
