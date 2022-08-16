/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {logFactory} from '../core.js';
const log = logFactory(logFactory.flags.services, 'Services', 'plum');

const ServicePortal = class {
  constructor() {
    this.handlers = [];
  }
  add(handler) {
    this.handlers.push(handler);
    return this;
  }
  async handle(runtime, host, request) {
    log(request.msg, request.data);
    for (const handler of this.handlers) {
      const value = await handler(runtime, host, request);
      if (value !== undefined) {
        return value;
      }
    }
  }
};

export const Basic = {
  system: async (runtime, host, request) => {
    switch (request.msg) {
      case 'request-context': {
        return {
          runtime
        };
      }
    }
  },
  user: async (runtime, host, request) => {
    switch (request.msg) {
      case 'particle-error': {
        //console.error(error);
      }
    }
  }
};

export const Services = {
  system: new ServicePortal().add(Basic.system),
  user: new ServicePortal().add(Basic.user)
};
