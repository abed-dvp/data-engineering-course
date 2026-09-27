#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../.."
docker compose up --build --abort-on-container-exit elt_script
