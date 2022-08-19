/**
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
({
render({persona}, state) {
  return {
    name: persona,
    names: [{name: 'George'}, {name: 'John'}, {name: 'Thomas'}, {name: 'James'}]
  };
},
template: html`

<b><span>{{name}}</span>'s Lobby</b>
<hr style="width: 100%;">
<div repeat="name_t">{{names}}</div>

<template name_t>
  <div>{{name}}</div>
</template>
`
});
