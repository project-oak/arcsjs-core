({
render(inputs) {
  return {
    ...inputs,
    objStrField: inputs.theObject.strField,
    objNestedNumField: inputs.theObject.nested.nestedNumField,
    objNNtrueField: inputs.theObject.nested.nestedObj.nnTrueField,
    selectedKey: inputs.selectedNode?.key || 'N/A'
  };
},
theStringChange({eventlet: {value}}) {
  return {theString: value};
},
numberWithDefaultChange({eventlet: {value}}) {
  return {numberWithDefault: value};
},
booleanDefaultTrueChange({eventlet, booleanDefaultTrue}) {
  return {booleanDefaultTrue: !booleanDefaultTrue};
},
objStrFieldChange({eventlet: {value}, theObject}) {
  return {theObject: {...theObject, strField: value}};
},
objNestedNumFieldChange({eventlet: {value}, theObject}) {
  return {theObject: {...theObject, nested: {...theObject.nested, nestedNumField: value}}};
},
objNNtrueFieldChange({eventlet, theObject}) {
  return {
    theObject: {
      ...theObject,
      nested: {
        ...theObject.nested,
        nestedObj: {
          ...theObject.nested.nestedObj,
          nnTrueField: !theObject.nested.nestedObj.nnTrueField
        }
      }
    }
  };
},
template: html`
<style>
  :host {
    height: 300px;
    width: 400px;
    white-space: nowrap;
    background-color: lightblue;
    padding: 20px;
  }
  [title] {
    padding-right: 10px;
  }
  [selected] {
    width: 250px;
    border: 3px solid blue;
  }
  [selectedkey] {
    color: red;
    font-weight: bold;
  }
</style>
<div selected><span title>selected node:</span><span selectedkey>{{selectedKey}}</span></div>
<div><span title>theString:</span><input type="text" value="{{theString}}" on-change="theStringChange"></div>
<div><span title>numberWithDefault:</span><input type="text" value="{{numberWithDefault}}" on-change="numberWithDefaultChange"></div>
<div><span title>numberWithRange:</span><span>{{numberWithRange}}</span></div>
<div><span title>booleanDefaultTrue:</span><input type="checkbox" checked="{{booleanDefaultTrue}}" on-change="booleanDefaultTrueChange"></div>
<hr>
<div><span title>objStrField:</span><input type="text" value="{{objStrField}}" on-change="objStrFieldChange"></div>
<div><span title>objNestedNumField:</span><input type="text" value="{{objNestedNumField}}" on-change="objNestedNumFieldChange"></div>
<div><span title>objNNtrueField:</span><input type="checkbox" checked="{{objNNtrueField}}" on-change="objNNtrueFieldChange"></div>
`
});