/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export function matches<T>(candidateMeta: T, targetMeta: Partial<T>): boolean {
  for (const property in targetMeta) {
    if (candidateMeta[property] !== targetMeta[property]) {
      return false;
    }
  }
  return true;
};

