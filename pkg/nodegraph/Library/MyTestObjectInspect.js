
({
render({data, key, propName}) {
  if (data?.key && data.key == key) {
    const prop = data.props.find(p => p.name === propName);
    const choiceProps = data.props.find(p => p.store.$type === '[MyTestObject]');
    if (prop) {
      return {
        hello: prop.value?.hello,
        world: prop.value?.world,
        choices: choiceProps.value?.map(value => ({name:`${value.hello}-${value.world}`})) || []
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
  :host {
    height: 150px;
    width: 250px;
    white-space: nowrap;
    background-color: lightpink;
    padding: 20px;
    border: 3px dotted green;
  }
  [title] {
    padding-right: 10px;
  }
  [choices] {
    padding-top: 10px;
  }
  [choice] {
    border: 1px solid fuchsia;
    padding: 3px;
    margin: 5px;
    background-color: lightsalmon;
    cursor: pointer;
  }
  [choice]:hover {
    background-color: salmon;
  }
</style>
<div>
  <span>hello:</span>
  <input type="text" key="hello" value="{{hello}}" on-change="onPropChange">
</div>
<div>
  <span>world:</span>
  <input type="text" key="world" value="{{world}}" on-change="onPropChange">
</div>
<div choices repeat="choice_t">{{choices}}</div>

<template choice_t>
  <div choice on-click="onPropSelect" value="{{name}}">{{name}}</div>
</template>
`
});
