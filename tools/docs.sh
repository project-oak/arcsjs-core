#!/bin/sh
# Copyright (c) 2022 Google LLC All rights reserved.
# Use of this source code is governed by a BSD-style
# license that can be found in the LICENSE file.

#npx typedoc #--theme ./tools/typedoc-themes/arcs

npx typedoc ./pkg/ts/*.ts ./pkg/ts/**/*.ts --out ./pkg/docs