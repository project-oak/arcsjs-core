
import {Xen} from '../../Library/Dom/Xen/xen-async.js';
import {XenCss} from '../../Library/Dom/Material/material-xen/xen.css.js';

class TestAdmin extends Xen.Async {
  static get observedAttributes() {
    return ['alltests'];
  }
  shouldRender({alltests}) {
    return Boolean(alltests);
  }
  render({alltests}, {result}) {
    return {
      ...result,
      tests: Object.keys(alltests).map(key => ({key, name: key.replace(/_/g,' ')})),
      value: result && JSON.parse(result.value),
      //pass: result ? result?.pass ? 'PASS' : 'fail' : '',
      pass: result?.pass === true ? 'PASS': '',
      fail: result?.pass === false ? 'fail' : ''
    };
  }
  async onTestOptionClick(e) {
    // Reset result ui.
    this.state.result = undefined;
    this.invalidate();

    const {currentTarget: {key}} = e;
    const test = this.props.alltests?.[key];
    if (test) {
      window.workbench.innerText = '';
      let result = {pass: false, value: 'unknown'};
      try {
        result = await test();
      } catch(x) {
        result.value = JSON.stringify(x);
        console.error(x);
      }
      this.mergeState({key, result});
    }
  }
  onResync() {
    const {key, result} = this.state;
    if (key && result) {
      return fetch(`https://arcsjs-apps.firebaseio.com/test/specs/${key}.json`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(result.value)
      });
    }
  }
  get template() {
    return Xen.Template.html`
<style>
  :host {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  pre {
    font-family: inherit;
    font-size: 11px;
  }
  [panel] {
    background-color: #eeeeee;
    color: #666666;
    border: 1px solid #f1f1f1;
    border-bottom-color: #333333;
    border-right-color: #333333;
    padding: 12px;
  }
  [row], [column] {
    display: flex;
    /* border: 2px solid lightblue; */
  }
  [column] {
   flex-direction: column;
   /* border: 1px solid orange; */
  }
  [test-catalog] {
    min-width: 240px;
    /* min-height: 400px; */
    padding-right: 48px;
  }
  [test-option] {
    cursor: pointer;
  }
  h5 {
    margin: 0 0 6px 0;
  }
  ::slotted(*) {
    display: flex;
    flex: 1;
  }
  [pass], [fail] {
    padding: 0 8px;
    background-color: lightgreen;
  }
  [fail] {
    background-color: pink;
  }
  ${XenCss}
</style>

<div flex column>
  <div flex x3 row>
    <div test-catalog column panel>
      <h5>Tests</h5>
      <ul flex scrolling test-option repeat="test_t">{{tests}}</ul>
    </div>
    <div workbench flex column panel>
      <h5>Workbench</h5>
      <div flex column>
        <slot></slot>
      </div>
    </div>
  </div>
  <div flex x2 column panel>
    <div toolbar style="padding-left: 0;">
      <button on-click="onResync">Reset Expected State</button>
    </div>
    <div flex column>
      <div fail>{{fail}}</div>
      <div pass>{{pass}}</div>
      <data-explorer flex scrolling object="{{value}}" expand></data-explorer>
    </div>
  </div>
</div>

<template test_t>
  <li>
    <div name key="{{key}}" on-click="onTestOptionClick">{{name}}</div>
  </li>
</template>
    `;
  }
};

customElements.define('test-admin', TestAdmin);
