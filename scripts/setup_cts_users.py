#!/usr/bin/env python3
"""
CTS demo environment setup.
Creates masks, users, and detokenize permissions on CT-VL.

Usage:
    python3 scripts/setup_cts_users.py

Requirements:
    pip install requests
"""

import os
import sys
import urllib3
import requests

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# ---------------------------------------------------------------------------
# Configuration
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

_ctm_ip = os.environ.get("CTM_IP") or _env.get("CTM_IP")
CTM_KEY_NAME   = os.environ.get("CTM_KEY_NAME")  or _env.get("CTM_KEY_NAME")  or "cts"
TOKEN_GROUP    = os.environ.get("TOKEN_GROUP")    or _env.get("TOKEN_GROUP")   or "defaultGroup"
TOKEN_TEMPLATE = os.environ.get("TOKEN_TEMPLATE") or _env.get("TOKEN_TEMPLATE") or "defaultTemplate"

CTS_BASE = f"https://{_cts_ip}/api"
ADMIN_USERNAME = "ctsroot"
ADMIN_PASSWORD = "N3oS3nh@2021"
USER_PASSWORD  = "N3oS3nh@2021"

CTM_BASE           = f"https://{_ctm_ip}/api/v1" if _ctm_ip else None
CTM_ADMIN_USERNAME = "admin"
CTM_ADMIN_PASSWORD = "N3oS3nh@2021"

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
    """Build permission template: copy from existing permission or discover from CT-VL resources."""
    r = session.get(f"{CTS_BASE}/permissions/token/users/")
    r.raise_for_status()
    for p in get_results(r.json()):
        if p.get("key"):
            return {
                "key": p.get("key", ""),
                "asymkey": p.get("asymkey", ""),
                "opaqueobj": p.get("opaqueobj", ""),
            }

    # Fresh CTS — discover resources directly
    keys = get_results(session.get(f"{CTS_BASE}/keys/").json())
    asymkeys = get_results(session.get(f"{CTS_BASE}/asymkeys/").json())
    opaqueobjs = get_results(session.get(f"{CTS_BASE}/opaqueobjs/").json())

    if not keys:
        print("ERROR: no symmetric keys found in CT-VL — create one first")
        sys.exit(1)

    return {
        "key": keys[0]["name"],
        "asymkey": asymkeys[0]["name"] if asymkeys else "",
        "opaqueobj": opaqueobjs[0]["name"] if opaqueobjs else "",
    }


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
# CTM key + CTS key registration
# ---------------------------------------------------------------------------

def get_ctm_token() -> str:
    r = requests.post(
        f"{CTM_BASE}/auth/tokens",
        json={"username": CTM_ADMIN_USERNAME, "password": CTM_ADMIN_PASSWORD},
        verify=False,
    )
    r.raise_for_status()
    return r.json()["jwt"]


def setup_ctm_key(ctm_token: str, key_name: str) -> None:
    headers = {"Authorization": f"Bearer {ctm_token}"}

    r = requests.get(
        f"{CTM_BASE}/vault/keys2",
        params={"name": key_name},
        headers=headers,
        verify=False,
    )
    r.raise_for_status()
    if r.json().get("total", 0) > 0:
        existing = r.json()["resources"][0]
        print(f"  CTM key '{key_name}' already exists")
        if not (existing.get("meta") or {}).get("global"):
            requests.patch(
                f"{CTM_BASE}/vault/keys2/{existing['id']}",
                json={"meta": {"global": True}},
                headers=headers,
                verify=False,
            ).raise_for_status()
            print(f"  enabled global usage on '{key_name}'")
        return

    # Get admin ownerId
    r2 = requests.get(
        f"{CTM_BASE}/usermgmt/users",
        params={"username": CTM_ADMIN_USERNAME},
        headers=headers,
        verify=False,
    )
    r2.raise_for_status()
    owner_id = r2.json()["resources"][0]["user_id"]

    r3 = requests.post(
        f"{CTM_BASE}/vault/keys2",
        json={
            "name": key_name,
            "algorithm": "AES",
            "size": 256,
            "undeletable": True,
            "unexportable": False,
            "meta": {"ownerId": owner_id},
        },
        headers=headers,
        verify=False,
    )
    r3.raise_for_status()
    key_id = r3.json()["id"]
    print(f"  created CTM key '{key_name}' (AES-256)")

    r4 = requests.patch(
        f"{CTM_BASE}/vault/keys2/{key_id}",
        json={"meta": {"global": True}},
        headers=headers,
        verify=False,
    )
    r4.raise_for_status()
    print(f"  enabled global usage on '{key_name}'")


def setup_cts_key(session: requests.Session, key_name: str) -> None:
    r = session.get(f"{CTS_BASE}/keys/")
    r.raise_for_status()
    for k in get_results(r.json()):
        if k["name"] == key_name:
            print(f"  CTS key '{key_name}' already registered")
            return
    r = session.post(f"{CTS_BASE}/keys/", json={"name": key_name})
    r.raise_for_status()
    print(f"  registered key '{key_name}' in CTS")


# ---------------------------------------------------------------------------
# Token group + template
# ---------------------------------------------------------------------------

def setup_token_group(session: requests.Session, group_name: str) -> None:
    r = session.get(f"{CTS_BASE}/tokengroups/")
    r.raise_for_status()
    for g in get_results(r.json()):
        if g["name"] == group_name:
            print(f"  token group '{group_name}' already exists")
            return

    keys = get_results(session.get(f"{CTS_BASE}/keys/").json())
    if not keys:
        print("ERROR: no keys found in CT-VL — sync key from CTM first")
        sys.exit(1)
    key_name = keys[0]["name"]

    r = session.post(f"{CTS_BASE}/tokengroups/", json={"name": group_name, "key": key_name})
    r.raise_for_status()
    print(f"  created token group '{group_name}' (key={key_name})")


def setup_token_template(session: requests.Session, group_name: str, template_name: str) -> None:
    r = session.get(f"{CTS_BASE}/tokentemplates/")
    r.raise_for_status()
    for t in get_results(r.json()):
        if t["name"] == template_name:
            print(f"  token template '{template_name}' already exists")
            return

    r = session.post(f"{CTS_BASE}/tokentemplates/", json={
        "name": template_name,
        "tenant": group_name,
        "format": "FPE",
        "charset": "All printable ASCII",
        "keepleft": 0,
        "keepright": 0,
        "irreversible": False,
        "copyruntdata": False,
        "allowsmallinput": True,
        "prefix": "",
    })
    r.raise_for_status()
    print(f"  created token template '{template_name}' (group={group_name})")


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

    if _ctm_ip:
        print("[ctm key]")
        ctm_token = get_ctm_token()
        setup_ctm_key(ctm_token, CTM_KEY_NAME)
        print("[cts key]")
        setup_cts_key(session, CTM_KEY_NAME)
        print()
    else:
        print("[ctm key] WARNING: CTM_IP not set in microtoken/.env — skipping CTM/CTS key setup.")
        print("          Ensure a key is already registered in CTS before continuing.")
        print("          Set CTM_IP and CTM_KEY_NAME in microtoken/.env to automate this step.\n")

    print("[token group]")
    setup_token_group(session, TOKEN_GROUP)
    print("[token template]")
    setup_token_template(session, TOKEN_GROUP, TOKEN_TEMPLATE)
    print()

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
