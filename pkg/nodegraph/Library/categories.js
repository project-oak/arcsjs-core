/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
const icons = ['coffee', 'shower', 'chair', 'flatware', 'light', 'casino', 'escalator', 'umbrella', 'theater_comedy', 'diamond'];
const colors = ['#540d6e', '#ee4266', '#ffd23f', '#3bceac', '#0ead69', '#335c67', '#aaa390', '#e09f3e', '#9e2a2b', '#540b0e'];

export const categorize = nodeList => {
  const categories = {};
  [...new Set(nodeList.map(n => n.$meta.category))].forEach((category, i) => {
    categories[category] = {
      icon: icons[i % (icons.length - 1)],
      color: `${colors[i % (colors.length - 1)]}ff`,
      bgColor: `${colors[i % (colors.length - 1)]}33`,
    };
  });
  return categories;
};
