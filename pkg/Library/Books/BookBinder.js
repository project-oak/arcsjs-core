/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
({
shouldUpdate({text}) {
  return text;
},

update({text, illustratedPages}, state) {
  text = text.replace(/\d+\. /g, '');
  if (state.text !== text) {
    state.text = text;
    state.pages = this.textToPages(text);
  }
  if (state.pages) {
    illustratedPages?.forEach((page, i) => {
      if (page.image && page.text === state.pages[i].text) {
        state.pages[i].image = page.image;
      }
    });
  }
  return {pages: state.pages};
},

textToPages(text) {
  const linesPerPage = 3;
  const pages = [];
  const lines = text.split('.');
  const charCount = text.length;
  const pageCount = Math.ceil(lines.length / linesPerPage);
  const charsPerPage = Math.floor(charCount / pageCount);
  // at most 9 pages
  for (let i=0; i<9; i++) {
    let chunk = '';
    // justify around 90%
    const bound = Math.round(charsPerPage * 0.9);
    while (bound > chunk.length && lines.length) {
      chunk = `${chunk}${lines.shift()}`;
      if (chunk && chunk.slice(-1) !== '.') {
        chunk = `${chunk}.`;
      }
    }
    //const text = lines.slice(i*linesPerPage, (i+1)*linesPerPage-1).join('. ');
    if (!chunk) {
      break;
    }
    pages[i] = {
      text: `${chunk}`,
      image: {url: ''},
      contentSafe: false
    };
  }
  return pages;
},

onSend({pages}) {
  return {
    finalizedPages: [...pages]
  };
},

render({}, {pages}) {
  return {
    pagesCount: pages?.length == 1 ? `1 page` : `${pages?.length ?? 0} pages`,
    pages: pages?.map(({text, image: {url}}) => ({
      text,
      image: url,
      pageStyle: `background-image: url('${url}')`
    }))
  };
},

template: html`
<style>
  :host {
    color: var(--theme-color-fg-1);
    background-color: var(--theme-color-bg-1);
  }
  [toolbar] {
    height: 50px;
  }
  [page] {
    border: 1px solid purple;
  }
  [image]>img {
    max-width: 40px;
    max-height: 40px;
  }
  [footer] {
    font-style: italic;
    border-top: 1px solid var(--theme-color-fg-0);
  }
  [page-text] {
    padding: 8px;
    padding-top: 24px;
    font-size: 0.9em;
    background: transparent;
    color: #eeeeee;
    /* background: linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(16,16,16,0.7) 81%, rgba(252,176,69,0) 100%); */
    background: linear-gradient(180deg, rgba(252,176,69,0) 0%, rgba(16,16,16,0.7) 19%, rgba(0,0,0,1) 100%);
  }
  [page] {
    min-width: 120px;
    background-color: black;
    background-size: cover;
  }
</style>
<div flex rows>
  <div flex columns scrolling repeat="page_t">{{pages}}</div>
  <div toolbar footer>
  <div flex>The book has <span>{{pagesCount}}</span></div>
    <div box bar>
      <mwc-button raised icon="send" on-click="onSend">finish book</mwc-button>
    </div>
  </div>
</div>

<template page_t>
  <div flex page column xen:style="{{pageStyle}}">
    <div flex></div>
    <div page-text>{{text}}</div>
  </div>
</template>
`
});