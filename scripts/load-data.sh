#! /bin/bash

clear

cd /var/www/isa-explorer

echo "Current directory: $PWD"

echo "Stopping the server..."
forever stop server.js

FELIST="${forever list}"
echo "${FELIST}"

source venv-3.5/bin/activate

echo "Downloading data via crossref..."
# python scripts/sdata_crossref_download.py
python scripts/sdata_crossref_full-live.py

echo "Building the index..."
python scripts/build_index.py data

echo "Generating schemaorg jsonld..."
python scripts/schemaorg_conversion.py

echo "Restarting the server..."
NODE_ENV=production PORT=80 forever start server.js
