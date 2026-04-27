#!/usr/bin/env python3
"""
CTS demo environment setup.
Creates masks, users, and detokenize permissions on CT-VL.

Usage:
    python3 scripts/setup_cts_users.py

Requirements:
    pip install requests
"""

import sys
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

CTS_BASE = "https://192.168.130.38/api"
ADMIN_USERNAME = "ctsroot"
ADMIN_PASSWORD = "N3oS3nh@2021"
USER_PASSWORD = "N3oS3nh@2021"

# Each entry: username, email, mask config
# showleft/showright = unmasked chars from left/right; maskchar = replacement char
DEMO_USERS = [
    {
        "username": "cpf",
        "email": "cpf@localhost.localdomain",
        "mask": {"name": "CPF", "showleft": 3, "showright": 2, "maskchar": "*"},
    },
    {
        "username": "rg",
        "email": "rg@localhost.localdomain",
        "mask": {"name": "RG", "showleft": 2, "showright": 2, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "email",
        "email": "email@localhost.localdomain",
        "mask": {"name": "EMAIL", "showleft": 3, "showright": 0, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "telefone",
        "email": "telefone@localhost.localdomain",
        "mask": {"name": "TELEFONE", "showleft": 2, "showright": 4, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "banco",
        "email": "banco@localhost.localdomain",
        "mask": {"name": "BANCO", "showleft": 1, "showright": 1, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "agencia",
        "email": "agencia@localhost.localdomain",
        "mask": {"name": "AGENCIA", "showleft": 2, "showright": 0, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "contacorrente",
        "email": "contacorrente@localhost.localdomain",
        "mask": {"name": "CONTACORRENTE", "showleft": 2, "showright": 2, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "responsavel",
        "email": "responsavel@localhost.localdomain",
        "mask": {"name": "RESPONSAVEL", "showleft": 3, "showright": 0, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "cnpj",
        "email": "cnpj@localhost.localdomain",
        "mask": {"name": "CNPJ", "showleft": 2, "showright": 2, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "beneficio",
        "email": "beneficio@localhost.localdomain",
        "mask": {"name": "BENEFICIO", "showleft": 2, "showright": 2, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "endereco",
        "email": "endereco@localhost.localdomain",
        "mask": {"name": "ENDERECO", "showleft": 3, "showright": 0, "maskchar": "*"},  # TODO: adjust
    },
    {
        "username": "nascimento",
        "email": "nascimento@localhost.localdomain",
        "mask": {"name": "NASCIMENTO", "showleft": 2, "showright": 2, "maskchar": "*"},  # TODO: adjust
    },
]

# ---------------------------------------------------------------------------
# API helpers
# ---------------------------------------------------------------------------

def get_token(session: requests.Session) -> str:
    r = session.post(
        f"{CTS_BASE}/api-token-auth/",
        json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD},
    )
    r.raise_for_status()
    token = r.json().get("token")
    if not token:
        print(f"ERROR: unexpected auth response: {r.json()}")
        sys.exit(1)
    return token


def get_results(data: list | dict) -> list:
    """Handle both plain list and paginated {results: [...]} responses."""
    return data if isinstance(data, list) else data["results"]


def find_mask(session: requests.Session, name: str) -> dict | None:
    r = session.get(f"{CTS_BASE}/masks/", params={"search": name})
    r.raise_for_status()
    for m in get_results(r.json()):
        if m["name"] == name:
            return m
    return None


def create_mask(session: requests.Session, cfg: dict) -> dict:
    existing = find_mask(session, cfg["name"])
    if existing:
        print(f"  mask '{cfg['name']}' already exists (id={existing['idmask']})")
        return existing
    r = session.post(
        f"{CTS_BASE}/masks/",
        json={
            "name": cfg["name"],
            "showleft": cfg["showleft"],
            "showright": cfg["showright"],
            "maskchar": cfg["maskchar"],
        },
    )
    r.raise_for_status()
    mask = r.json()
    print(f"  created mask '{mask['name']}' (id={mask['idmask']})")
    return mask


def find_user(session: requests.Session, username: str) -> dict | None:
    r = session.get(f"{CTS_BASE}/users/", params={"search": username})
    r.raise_for_status()
    for u in get_results(r.json()):
        if u["username"] == username:
            return u
    return None


def create_user(session: requests.Session, cfg: dict) -> dict:
    existing = find_user(session, cfg["username"])
    if existing:
        print(f"  user '{cfg['username']}' already exists (id={existing['id']})")
        return existing
    r = session.post(
        f"{CTS_BASE}/users/",
        json={
            "username": cfg["username"],
            "email": cfg["email"],
            "password": USER_PASSWORD,
            "is_superuser": True,
            "is_staff": True,
        },
    )
    r.raise_for_status()
    user = r.json()
    print(f"  created user '{user['username']}' (id={user['id']})")
    return user


def assign_mask(session: requests.Session, user: dict, mask_name: str) -> None:
    if user.get("mask") == mask_name:
        print(f"  mask '{mask_name}' already assigned")
        return
    # mask is readOnly in swagger schema but worth trying via PUT
    payload = {k: v for k, v in user.items() if k != "id"}
    payload["mask"] = mask_name
    r = session.put(f"{CTS_BASE}/users/{user['id']}/", json=payload)
    if r.ok and r.json().get("mask") == mask_name:
        print(f"  assigned mask '{mask_name}' via API")
    else:
        print(
            f"  WARNING: mask assignment via API failed for '{user['username']}'\n"
            f"           -> assign manually: CT-VL admin > User > {user['username']} > Mask = {mask_name}"
        )


def get_permission_template(session: requests.Session) -> dict:
    """Copy all fields from an existing token permission to use as template for new ones."""
    r = session.get(f"{CTS_BASE}/permissions/token/users/")
    r.raise_for_status()
    perms = get_results(r.json())
    for p in perms:
        if p.get("key"):
            return {
                "key": p.get("key", ""),
                "asymkey": p.get("asymkey", ""),
                "opaqueobj": p.get("opaqueobj", ""),
            }
    print("ERROR: no existing token permissions found to use as template — create CPF permission manually first")
    sys.exit(1)


def assign_detokenize(session: requests.Session, username: str, tmpl: dict) -> None:
    r = session.get(
        f"{CTS_BASE}/permissions/token/users/",
        params={"user__username": username},
    )
    r.raise_for_status()
    for p in get_results(r.json()):
        if p["user"] == username and p.get("canGet"):
            print(f"  detokenize permission already exists")
            return
    r = session.post(
        f"{CTS_BASE}/permissions/token/users/",
        json={**tmpl, "user": username, "canGet": True, "canPost": False},
    )
    r.raise_for_status()
    print(f"  assigned detokenize permission")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    session = requests.Session()
    session.verify = False

    print("Authenticating with CT-VL...")
    token = get_token(session)
    session.headers["Authorization"] = f"Bearer {token}"
    print("OK\n")

    tmpl = get_permission_template(session)

    failed = []
    for cfg in DEMO_USERS:
        print(f"[{cfg['username']}]")
        try:
            mask = create_mask(session, cfg["mask"])
            user = create_user(session, cfg)
            assign_mask(session, user, mask["name"])
            assign_detokenize(session, cfg["username"], tmpl)
        except requests.HTTPError as e:
            print(f"  ERROR: {e.response.status_code} {e.response.text}")
            failed.append(cfg["username"])

    print()
    if failed:
        print(f"FAILED users: {', '.join(failed)}")
        sys.exit(1)
    else:
        print("All users configured successfully.")


if __name__ == "__main__":
    main()
