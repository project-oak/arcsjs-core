#!/bin/sh
# Copyright 2022 Google LLC
#
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

echo ':: npx esbuild'
npx esbuild ./pkg/arcs.ts --bundle --minify --sourcemap --target=esnext --format=esm --outfile=./pkg/arcs.min.js
npx esbuild ./pkg/arcs.ts --bundle --sourcemap --format=esm --outfile=./pkg/arcs.js
npx esbuild ./pkg/crdt.ts --bundle --minify --sourcemap --target=esnext --format=esm --outfile=./pkg/crdt.min.js
npx esbuild ./pkg/ses.ts --bundle --minify --sourcemap --target=esnext --format=esm --outfile=./pkg/ses.min.js
npx esbuild ./pkg/utils.ts --bundle --minify --sourcemap --target=esnext --format=esm --outfile=./pkg/utils.min.js
echo ':: done.'
