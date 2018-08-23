#!/bin/sh
set -eu
cd /host-backstop
echo 'installing npm - may take a while - be patient'
npm install --loglevel=error --progress=false
cd test/configs
../../cli/index.js test --config=backstop_features.js
