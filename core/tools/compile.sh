#!/bin/sh
# Copyright 2022 Google LLC
#
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

#echo ':: npm install'
#npm install --prefer-offline
echo ':: npx tsc'
npx tsc --build
rm ../pkg/Library/Core/core/Particle.js
cp ../core/js/core/Particle.js ../pkg/Library/Core/core/Particle.js
echo ':: done.'
