#!/bin/bash
set -e

echo "==> Starting containers..."
docker compose up -d --build

echo ""
echo "==> Setting up CTS users..."
if ! python3 -c "import requests" 2>/dev/null; then
    echo "Installing requests..."
    pip install requests -q
fi
python3 scripts/setup_cts_users.py

echo ""
echo "==> Done. Services running:"
echo "    Frontend : http://localhost:5173"
echo "    Backend  : http://localhost:8000"
echo "    Microtoken: http://localhost:3700"
