#!/bin/sh
clear
set -m # enable job control
PORT=$(npm run --silent get_port)

node ./node_modules/local-web-server/bin/cli.js -p $PORT "$@" &

echo $! >> /tmp/arcsjs_core_server.pid
fg # wait on the server
