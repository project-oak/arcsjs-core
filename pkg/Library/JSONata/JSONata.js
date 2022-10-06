({
initialize(inputs, state, {service}) {
  state.evaluate = data => service({kind: 'JSONataService', msg: 'evaluate', data})
},
shouldUpdate({json, expression}) {
  return Boolean(json && expression);
},
async update({json, expression}, {evaluate}) {
  const result = await evaluate({json, expression});
  return result;
}
});
