/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

({
render({search}) {
  return {
    search: search || '',
    hideClearSearchButton: !(search?.length > 0)
  };
},

onTextChanged({eventlet: {value}}) {
  return {search: value};
},

onClearClick() {
  return {search: ''};
},

template: html`
<style>
  :host {
    height: 100%;
    overflow: hidden;
  }
  [search-container] {
    position: relative;
    background-color: #e8eaed;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 13px 20px;
    color: #5f6368;
  }
  [search-container] input {
    width: 100%;
    height: 40px;
    border-radius: 20px;
    border: none;
    box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15);
    padding: 0 40px 0 40px;
  }
  [search-container] icon {
    position: absolute;
    font-size: 24px;
  }
  [search-container] icon[search] {
    left: 32px;
  }
  [search-container] icon[clear] {
    right: 32px;
  }
</style>
<!-- TODO(jingjin): Show drop down for suggestions -->
<div search-container>
  <icon search>search</icon>
  <input placeholder="Search nodes" on-input="onTextChanged" value="{{search}}"/>
  <icon clear hide$="{{hideClearSearchButton}}" on-click="onClearClick">
    close
  </icon>
</div>
`
});
