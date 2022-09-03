/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

const GoodMap = (() => {
  // resolves when window.__initGoodMap is called via JSONP protocol in dynamic script tag
  const callbackPromise = new Promise(resolve => window.__initGoodMap = resolve);
  // semaphore
  let initCalled;
  // api bootstrapping
  function loadGoogleMaps(apiKey) {
    if (!initCalled) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=__initGoodMap`;
      document.head.appendChild(script);
      initCalled = true;
    }
    return callbackPromise;
  }
  // define custom element
  return class extends HTMLElement {
    static get observedAttributes() {
      return ['api-key', 'zoom', 'latitude', 'longitude', 'map-options'];
    }
    attributeChangedCallback(name, oldVal, val) {
      switch (name) {
        case 'api-key':
          this.apiKey = val;
          break;
        case 'zoom':
        case 'latitude':
        case 'longitude':
          this[name] = parseFloat(val);
          break;
        case 'map-options':
          this.extraOptions = JSON.parse(val);
          break;
      }
      if (this.map) {
        this.map.setOptions(this.constructMapOptions());
      }
    }
    constructor() {
      super();
      this.apiKey = 'AIzaSyDh4RiNiMJsjVZD-O6j9KofEmwNLPiB8As';
      this.map = null;
      this.zoom = 8;
      this.latitude = 0;
      this.longitude = 0;
      this.extraOptions = {};
    }
    connectedCallback() {
      loadGoogleMaps(this.apiKey).then(() => {
        this.map = new window.google.maps.Map(this, this.constructMapOptions());
        this.dispatchEvent(new CustomEvent('google-map-ready', {detail: this.map}));
      });
    }
    constructMapOptions() {
      const mapOptions = {...this.extraOptions};
      if (this.zoom) {
        mapOptions.zoom = this.zoom || 0;
      }
      if (this.latitude || this.longitude) {
        mapOptions.center = {
          lat: this.latitude ?? 0,
          lng: this.longitude ?? 0
        };
      }
      console.log('[good-map] mapOptions:', mapOptions);
      return mapOptions;
    }
  };
})();

// define custom element
customElements.define('good-map', GoodMap);
