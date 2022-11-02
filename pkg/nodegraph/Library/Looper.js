
({
  initialize(inputs, state) {
    console.log('---- looper init');
    state.mode = 'wait';
    state.count = 0;
    state.trigger = inputs.trigger;
  },
  async update(inputs, state) {
    if (state.mode === 'wait' && state.trigger !== inputs.trigger) {
      state.mode = 'start';
      state.count = 8;
      state.prompt = 'z';
    }
    if (state.count > 0) {
      state.count--;
      if (state.mode === 'continue') {
        state.prompt += inputs.feedback;
      }
      state.mode = 'continue';
      console.log(`looper ${state.count} |${state.prompt}|`);
      return {prompt: state.prompt};
    }
  }
});
