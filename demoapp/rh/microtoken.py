import json
import logging

import requests

from demoapp.settings import MICROTOKEN_BASE_URL

logger = logging.getLogger("loggers")

MICROTOKEN_TIMEOUT_SECONDS = 5


class MicrotokenError(Exception):
    def __init__(self, message, *, status_code=503):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def call_microtoken(endpoint, payload, *, operation, field_name, extra_log_context=""):
    url = f"{MICROTOKEN_BASE_URL}{endpoint}"

    try:
        response = requests.post(
            url=url,
            data=json.dumps(payload),
            headers={"Content-Type": "application/json"},
            timeout=MICROTOKEN_TIMEOUT_SECONDS,
        )
    except requests.Timeout as exc:
        message = f"Microtoken API timed out during {operation} for {field_name}."
        logger.error("%s endpoint: %s%s", message, url, extra_log_context)
        raise MicrotokenError(message, status_code=503) from exc
    except requests.RequestException as exc:
        message = f"Microtoken API is unavailable during {operation} for {field_name}."
        logger.error("%s endpoint: %s%s", message, url, extra_log_context)
        raise MicrotokenError(message, status_code=503) from exc

    try:
        body = response.json()
    except ValueError as exc:
        message = f"Microtoken API returned invalid JSON during {operation} for {field_name}."
        logger.error("%s endpoint: %s status_code: %s%s", message, url, response.status_code, extra_log_context)
        raise MicrotokenError(message, status_code=502) from exc

    if response.status_code != 200:
        message = f"Microtoken API returned HTTP {response.status_code} during {operation} for {field_name}."
        logger.error("%s endpoint: %s response: %s%s", message, url, body, extra_log_context)
        raise MicrotokenError(message, status_code=502)

    if body.get("status") == "error":
        reason = body.get("reason") or body.get("error") or "unknown error"
        message = f"Microtoken API rejected {operation} for {field_name}: {reason}."
        logger.error("%s endpoint: %s%s", message, url, extra_log_context)
        raise MicrotokenError(message, status_code=502)

    return body
