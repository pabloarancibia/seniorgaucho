#!/usr/bin/env bash
set -euo pipefail

ZURIBOATS_DIR="/home/ecom/Codes/zuriboats"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$SCRIPT_DIR/frontend/public/zuriboats-docs"
MKDOCS_BIN="$ZURIBOATS_DIR/.venv-docs/bin/mkdocs"

if [ ! -d "$ZURIBOATS_DIR" ]; then
  echo "No se encontró $ZURIBOATS_DIR" >&2
  exit 1
fi

if [ ! -x "$MKDOCS_BIN" ]; then
  echo "No se encontró mkdocs en $MKDOCS_BIN (¿falta el venv .venv-docs en zuriboats?)" >&2
  exit 1
fi

cd "$ZURIBOATS_DIR"
"$MKDOCS_BIN" build --strict --site-dir "$OUTPUT_DIR"
echo "Zuriboats sincronizado en $OUTPUT_DIR"
