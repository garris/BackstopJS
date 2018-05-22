#!/usr/bin/env bash
set -eu
MYDIR=$(dirname ${BASH_SOURCE[0]})
BSDIR=`cd $MYDIR/../.. && pwd`
docker build $BSDIR/test/configs/linux -t backstop_smoke
mkdir -p $BSDIR/test/configs/linux/node_modules
docker run -v $BSDIR:/host-backstop -v $BSDIR/test/configs/linux/node_modules:/host-backstop/node_modules backstop_smoke /bin/bash -c "cd /host-backstop && echo 'installing npm - may take a while - be patient' && npm install --loglevel=error --progress=false && cd test/configs && ../../cli/index.js test --config=backstop_features.js"
