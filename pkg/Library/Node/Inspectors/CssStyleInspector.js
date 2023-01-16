/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
  render({data, key, propName}) {
    if (data?.key == key) {
      const prop = data.props.find(p => p.name === propName);
      //const choiceProps = data.props.find(p => p.store.$type === 'CssStyle');
      if (prop) {
        return {
          // hello: prop.value?.hello,
          // world: prop.value?.world,
          // choices: choiceProps?.value?.map(value => ({name:`${value.hello}-${value.world}`})) || []
        };
      }
    }
  },
  onPropChange({eventlet: {key, value}, data, propName}) {
    return this.updateValue(data, propName, {[key]: value});
  },
  onPropSelect({eventlet: {value}, data, propName}) {
    const [hello, world] = value.split('-');
    return this.updateValue(data, propName, {hello, world});
  },
  updateValue(data, propName, newValue) {
    const index = data.props.findIndex(p => p.name === propName);
    const prop = data.props[index];
    data.props = assign([], data.props, {
      [index]: {
        ...prop,
        value: {...prop.value, ...newValue}
      }
    });
    return {data};
  },
  template: html`
  <style>
    /*
    :host {
      height: 150px;
      width: 250px;
      white-space: nowrap;
      padding: 20px;
      background-color: lightpink;
      border: 3px dotted green;
    }
    */
    [cell] {
      padding: 0 6px 6px 0;
    }
    [cell]:last-of-type {
      padding-right: 0;
    }
    [label] {
      font-size: 0.7em;
      padding-bottom: 2px;
    }
    select {
      font-size: 0.8em;
      width: 100%;
      border-radius: 8px;
      padding: 3px 2px;
      border: 1px solid var(--theme-color-fg-0);
    }
    input {
     font-size: 0.8em;
    }
  </style>

  <div style="padding-bottom: 8px;">CssStyle</div>

  <div grid>
    <div cell>
      <div label>Flex</div>
      <select>
        <option>none</option>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
      </select>
    </div>

    <div cell>
      <div label>Display</div>
      <select>
        <option>block</option>
        <option>flex</option>
        <option>inline-block</option>
        <option>inline-flex</option>
      </select>
    </div>

    <div cell>
      <div label>Bg</div>
      <input type="color">
    </div>

    <div cell>
      <div label>Fg</div>
      <input type="color">
    </div>

    <div cell>
      <div label>Shape</div>
      <select>
        <option>none</option>
        <option>column</option>
        <option>row</option>
      </select>
    </div>

    <div cell>
      <div label>Align</div>
      <select>
        <option>start</option>
        <option>center</option>
        <option>end</option>
      </select>
    </div>

    <div cell>
      <div label>Justify</div>
      <select>
        <option>start</option>
        <option>center</option>
        <option>end</option>
      </select>
    </div>

  </div>
`
  });
