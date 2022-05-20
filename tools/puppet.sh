#!/bin/sh
set -m # enable job control

echo "[puppet]:: spinning up webserver"

PORT=$(npm run --silent get_port)
node ./node_modules/local-web-server/bin/cli.js -p $PORT "$@" &
PID="$!";

echo "[puppet]:: run puppeteer"
node ./tools/puppet.js
TEST_CODE="$?";

#echo "[puppet]:: wait for 5s"
#sleep 5

echo "[puppet]:: kill webserver"
kill $PID || echo "server was not running"

# forward the puppeteer exit code
exit $TEST_CODE;
