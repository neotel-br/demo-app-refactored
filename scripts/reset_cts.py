#!/usr/bin/env python3
"""
CTS demo environment reset.
Deletes permissions, users, and masks created by setup_cts_users.py.

Usage:
    python3 scripts/reset_cts.py

Requirements:
    pip install requests
"""

import os
import sys
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ---------------------------------------------------------------------------
# Configuration (mirrors setup_cts_users.py)
# ---------------------------------------------------------------------------

def _load_env(path: str) -> dict:
    env = {}
    try:
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, _, v = line.partition("=")
                env[k.strip()] = v.strip().strip('"').strip("'")
    except FileNotFoundError:
        pass
    return env

_env_file = os.path.join(os.path.dirname(__file__), "..", "microtoken", ".env")
_env = _load_env(_env_file)

_cts_ip = os.environ.get("CTS_IP") or _env.get("CTS_IP")
if not _cts_ip:
    print("ERROR: CTS_IP not set in microtoken/.env or environment")
    sys.exit(1)

CTM_KEY_NAME   = os.environ.get("CTM_KEY_NAME")  or _env.get("CTM_KEY_NAME")  or "cts"
TOKEN_GROUP    = os.environ.get("TOKEN_GROUP")    or _env.get("TOKEN_GROUP")   or "defaultGroup"
TOKEN_TEMPLATE = os.environ.get("TOKEN_TEMPLATE") or _env.get("TOKEN_TEMPLATE") or "defaultTemplate"

CTS_BASE = f"https://{_cts_ip}/api"
ADMIN_USERNAME = "ctsroot"
ADMIN_PASSWORD = "N3oS3nh@2021"

DEMO_USERNAMES = [
    # current
    "cpf", "rg", "email", "telefone", "banco", "agencia",
    "contacorrente", "responsavel", "cnpj", "beneficio", "endereco", "nascimento",
    # legacy (previous runs with different naming/typos)
    "reponsavel", "data", "salario", "conta",
]

DEMO_MASK_NAMES = [
    # current (uppercase)
    "CPF", "RG", "EMAIL", "TELEFONE", "BANCO", "AGENCIA",
    "CONTACORRENTE", "RESPONSAVEL", "CNPJ", "BENEFICIO", "ENDERECO", "NASCIMENTO",
    # legacy (Title Case from previous runs)
    "Responsavel", "Beneficio", "Endereco", "Agencia", "Banco",
    "Telefone", "E-mail", "Data", "Salario", "Conta",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_FAKE_CSRF = "ctsdemocsrftoken1234567890abcdef"

def inject_csrf(session: requests.Session) -> None:
    """CT-VL DELETE endpoints require matching csrftoken cookie + X-CSRFToken header."""
    session.cookies.set("csrftoken", _FAKE_CSRF, domain=_cts_ip, path="/")
    session.headers["X-CSRFToken"] = _FAKE_CSRF
    session.headers["Referer"] = f"https://{_cts_ip}/"


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
    return data if isinstance(data, list) else data.get("results", [])


# ---------------------------------------------------------------------------
# Delete steps
# ---------------------------------------------------------------------------

def delete_permissions(session: requests.Session) -> None:
    print("Deleting detokenize permissions...")
    for username in DEMO_USERNAMES:
        r = session.get(
            f"{CTS_BASE}/permissions/token/users/",
            params={"user__username": username},
        )
        r.raise_for_status()
        perms = get_results(r.json())
        if not perms:
            print(f"  [{username}] no permissions found")
            continue
        for p in perms:
            pid = p.get("id") or p.get("idpermission")
            dr = session.delete(f"{CTS_BASE}/permissions/token/users/{pid}")
            if dr.status_code in (200, 204):
                print(f"  [{username}] deleted permission id={pid}")
            else:
                print(f"  [{username}] WARNING: DELETE permission {pid} -> {dr.status_code} {dr.text}")


def delete_users(session: requests.Session) -> None:
    print("Deleting users...")
    for username in DEMO_USERNAMES:
        r = session.get(f"{CTS_BASE}/users/", params={"search": username})
        r.raise_for_status()
        users = [u for u in get_results(r.json()) if u["username"] == username]
        if not users:
            print(f"  [{username}] not found")
            continue
        uid = users[0]["id"]
        dr = session.delete(f"{CTS_BASE}/users/{uid}")
        if dr.status_code in (200, 204):
            print(f"  [{username}] deleted (id={uid})")
        else:
            print(f"  [{username}] WARNING: DELETE user {uid} -> {dr.status_code} {dr.text}")


def delete_masks(session: requests.Session) -> None:
    print("Deleting masks...")
    for name in DEMO_MASK_NAMES:
        r = session.get(f"{CTS_BASE}/masks/", params={"search": name})
        r.raise_for_status()
        masks = [m for m in get_results(r.json()) if m["name"] == name]
        if not masks:
            print(f"  [{name}] not found")
            continue
        mid = masks[0]["idmask"]
        dr = session.delete(f"{CTS_BASE}/masks/{mid}")
        if dr.status_code in (200, 204):
            print(f"  [{name}] deleted (id={mid})")
        else:
            print(f"  [{name}] WARNING: DELETE mask {mid} -> {dr.status_code} {dr.text}")


# ---------------------------------------------------------------------------
# Token group + template
# ---------------------------------------------------------------------------

def delete_cts_key(session: requests.Session) -> None:
    print("Deleting CTS key...")
    r = session.get(f"{CTS_BASE}/keys/")
    r.raise_for_status()
    for k in get_results(r.json()):
        if k["name"] == CTM_KEY_NAME:
            kid = k["idkey"]
            dr = session.delete(f"{CTS_BASE}/keys/{kid}")
            if dr.status_code in (200, 204):
                print(f"  deleted CTS key '{CTM_KEY_NAME}' (id={kid})")
            else:
                print(f"  WARNING: DELETE key {kid} -> {dr.status_code} {dr.text[:100]}")
            return
    print(f"  CTS key '{CTM_KEY_NAME}' not found")


def delete_token_template(session: requests.Session) -> None:
    print("Deleting token template...")
    r = session.get(f"{CTS_BASE}/tokentemplates/")
    r.raise_for_status()
    for t in get_results(r.json()):
        if t["name"] == TOKEN_TEMPLATE:
            tid = t["idtokentemplate"]
            dr = session.delete(f"{CTS_BASE}/tokentemplates/{tid}")
            if dr.status_code in (200, 204):
                print(f"  deleted template '{TOKEN_TEMPLATE}' (id={tid})")
            else:
                print(f"  WARNING: DELETE template {tid} -> {dr.status_code} {dr.text[:100]}")
            return
    print(f"  template '{TOKEN_TEMPLATE}' not found")


def delete_token_group(session: requests.Session) -> None:
    print("Deleting token group...")
    r = session.get(f"{CTS_BASE}/tokengroups/")
    r.raise_for_status()
    for g in get_results(r.json()):
        if g["name"] == TOKEN_GROUP:
            gid = g["idtenant"]
            dr = session.delete(f"{CTS_BASE}/tokengroups/{gid}")
            if dr.status_code in (200, 204):
                print(f"  deleted group '{TOKEN_GROUP}' (id={gid})")
            else:
                print(f"  WARNING: DELETE group {gid} -> {dr.status_code} {dr.text[:100]}")
            return
    print(f"  group '{TOKEN_GROUP}' not found")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    session = requests.Session()
    session.verify = False

    print(f"Authenticating with CT-VL ({_cts_ip})...")
    inject_csrf(session)
    token = get_token(session)
    session.headers["Authorization"] = f"Bearer {token}"
    print("OK\n")

    delete_permissions(session)
    print()
    delete_users(session)
    print()
    delete_masks(session)
    print()
    delete_token_template(session)
    print()
    delete_token_group(session)
    print()
    delete_cts_key(session)
    print()
    print("Reset complete.")


if __name__ == "__main__":
    main()
