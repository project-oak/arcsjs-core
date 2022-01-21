#!/bin/sh
# Copyright (c) 2022 Google LLC All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

echo '#### clean'
./tools/clean.sh
echo '#### compile'
./tools/compile.sh
echo '#### bundle'
./tools/bundle.sh
echo '#### done.'
