
({
  initialize(inputs, state) {
    console.log('---- piper init');
    state.outputs = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm'];
  },
  shouldUpdate(inputs, state) {
    return !!inputs.prompt;
  },
  async update(inputs, state) {
    const token = state.outputs.shift();
    state.outputs.push(token);
    console.log(`piper    |${inputs.prompt}| -> ${token}`);
    return {result: ' ' + token};
  }
  });
