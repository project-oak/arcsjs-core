/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = ({log}) => {

  const template = html`

  <style>
    * {
      box-sizing: border-box;
    }
    :host {
      position: absolute;
      inset: 0;
      background-color: transparent;
    }
  </style>

  <object-selector on-selection="onSelection"></object-selector>
  `;

  return {
    get template() {
      return template;
    },
    update({}, state) {
    },
    render({}, {}) {
      return {};
    },
    async onSelection({eventlet: {value}}) {
      log(value);
      return {boxSelection: value};
    }
  };

};
