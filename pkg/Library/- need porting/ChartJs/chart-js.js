/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {Xen} from './Dom/xen/xen-async.js.js.js';
import 'https://cdn.jsdelivr.net/npm/chart.js@3.8.0/dist/chart.min.js';

const {Chart} = window;

export const ChartJsChart = class extends Xen.Async {
  static get observedAttributes() {
    return [];
  }
  _didMount() {
    this.canvas = this._dom.$('canvas');
  }
  update() {
    if (!this.chart) {
      this.doStuff();
    }
  }
  doStuff() {
    const data = {
      labels: [
        'Red',
        'Blue',
        'Yellow'
      ],
      datasets: [{
        label: 'My First Dataset',
        data: [300, 50, 100],
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)'
        ],
        hoverOffset: 4
      }]
    };
    this.chart = new Chart(this.canvas, {type: 'pie', data});
  }
  get template() {
    return html`
<div style="width: 400px; height: 400px;">
  <canvas></canvas>
</div>
    `;
  }
};

document.customElements.define('chart-js-chart', ChartJsChart);