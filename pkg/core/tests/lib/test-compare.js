/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export const deepEqualVisitor = (a, b, visitor, key) => {
  const answer = visitor(a, b, key);
  if (answer === true || answer === false) {
    return answer;
  }
  const type = typeof a;
  // must be same type to be equal
  if (type !== typeof b) {
    return false;
  }
  // we are `deep` because we recursively study object types
  if (type === 'object' && a && b) {
    const aProps = Object.getOwnPropertyNames(a);
    const bProps = Object.getOwnPropertyNames(b);
    // equal if same # of props, and no prop is not deepEqual
    return (aProps.length == bProps.length) && !aProps.some(name => !deepEqualVisitor(a[name], b[name], visitor, name));
  }
  // finally, perform simple comparison
  return (a === b);
};