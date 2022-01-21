#!/bin/sh
# Copyright (c) 2022 Google LLC All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

echo ':: npx esbuild'
npx esbuild ./pkg/arcs.ts --bundle --minify --sourcemap --target=esnext --format=esm --outfile=./pkg/arcs.min.js
npx esbuild ./pkg/arcs.ts --bundle --format=esm --outfile=./pkg/arcs.js
echo ':: done.'
