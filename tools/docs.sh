#!/bin/sh
# Copyright 2022 Google LLC
# 
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file or at
# https://developers.google.com/open-source/licenses/bsd

#npx typedoc #--theme ./tools/typedoc-themes/arcs

npx typedoc ./pkg/ts/*.ts ./pkg/ts/**/*.ts --out ./pkg/docs