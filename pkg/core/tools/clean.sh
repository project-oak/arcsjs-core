#!/bin/sh
# Copyright 2022 Google LLC
# 
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

echo ':: npx tsc --build --clean'
npx tsc --build --clean
echo ':: done.'
