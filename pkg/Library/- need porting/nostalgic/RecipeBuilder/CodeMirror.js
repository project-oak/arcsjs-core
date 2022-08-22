/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const particle = () => {

  const template = html`
  <style>
    :host {
      display: flex;
      flex: 1;
      overflow: hidden;
    }
    code-mirror {
      height: 96px;
      flex: 1;
    }
    [flex] {
      flex: 1;
    }
    [toolbar] {
      display: flex;
      align-items: center;
      padding: 8px 0 8px 8px;
      background-color: #414141;
    }
    [toolbar] > * {
      margin-right: 12px;
    }
    [disabled="true"] {
      background-color: transparent;
    }
    [title] {
      font-weight: bold;
    }
    [help] {
      color: white;
    }
  </style>

  <div toolbar>
    <span flex title>{{title}}</span>
    <!-- <span help hidden={{readonly}}>
      <a help target="_blank" href="./docs/interfaces/core_particle.particleapi.html">
        Particle API
      </a>
    </span> -->
  </div>

  <code-mirror text="{{code}}" readonly="{{readonly}}" on-changes="onChanges"></code-mirror>

  <!-- <div flex rows editor hidden="{{hideConsole}}" slot="console"></div> -->

  <div toolbar disabled="{{clean}}">
    <span flex></span>
    <mwc-button disabled$="{{clean}}" on-click="onDiscard">Discard Changes</mwc-button>
    <mwc-button raised disabled$="{{clean}}" on-click="onCommit">Commit Changes</mwc-button>
  </div>

  `;

return {
  render({}, {document, dirty}) {
    return {
      title: document?.title || 'Unknown',
      code: document?.content || 'N/A',
      readonly: document?.readonly || false,
      clean: !dirty,
    }
  },
  get template() {
    return template;
  },
  update({document}, state) {
    state.document = {...document};
  },
  // update({document, showConsole}, state) {
  //   let output = {};
  //   if (document?.title !== state.lastTitle) {
  //     state.lastTitle = document?.title;
  //     output = {dirty: false};
  //   }
  //   const code = document?.content;
  //   // if input code has changed
  //   if (code !== state.code) {
  //     // memoize it
  //     state.code = code;
  //     //log('input code changed');
  //     // is it different from our editor code?
  //     if (code !== state.editorCode) {
  //       state.editorCode = code;
  //       //log('editor code changed');
  //     }
  //   }
  //   state.showConsoleChanged = (showConsole !== state.showConsole);
  //   state.showConsole = showConsole;
  //   this.output(output);
  // }
  // shouldRender({}, {editorCode, showConsoleChanged}) {
  //   return (typeof editorCode === 'string') || showConsoleChanged;
  // }
  // render({document, readonly, dirty, showConsole}, {editorCode}) {
  //   return {
  //     clean: !dirty,
  //     readonly: Boolean(readonly),
  //     code: editorCode || document?.content || '',
  //     codeReloadable: true,
  //     buttonText: "Commit Changes",
  //     title: document?.title ?? '',
  //     hideConsole: !Boolean(showConsole),
  //   };
  // }

  onChanges({eventlet: {value}, document}, state) {
    // TODO(sjmiles): this could be an expensive test,
    // probably need to be smarter about it
    if (state.document.content !== value) {
      state.document.content = value; //{...document, content: value};
      if (document?.content !== value) {
        state.dirty = true;
      }
    }
  },
  onCommit({}, state) {
    state.dirty = false;
    return {
      modifiedDocument: state.document
    };
  },
  onDiscard({document}, state) {
    state.document = {...document};
    state.dirty = false;
  }
};

};
