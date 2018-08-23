#!/usr/bin/env bash
set -eu
MYDIR=$(dirname ${BASH_SOURCE[0]})
BSDIR=`cd $MYDIR/../.. && pwd`
docker build $BSDIR/test/configs/linux -t backstop_smoke
docker run -v $BSDIR:/host-backstop -v bs-linux-npm:/host-backstop/node_modules backstop_smoke /bin/bash -c "/host-backstop/test/smoke/smoke_in_docker.sh"
