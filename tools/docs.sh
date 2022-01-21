#!/bin/sh
#npx typedoc #--theme ./tools/typedoc-themes/arcs

npx typedoc ./pkg/ts/*.ts ./pkg/ts/**/*.ts --out ./pkg/docs