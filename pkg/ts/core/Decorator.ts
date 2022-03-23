/**
 * Copyright 2022 Google LLC
 * 
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */
import {logFactory} from '../utils/log.js';
import {deepCopy} from '../utils/object.js';

const log = logFactory(logFactory.flags.decorator, 'Decorator', 'plum');

const {values, entries} = Object;

const opaqueData = {};

export const Decorator = {
  setOpaqueData(name, data) {
    opaqueData[name] = data;
    return name;
  },
  getOpaqueData(name) {
    return opaqueData[name];
  },
  maybeDecorateModel(model, particle) {
    if (model && !Array.isArray(model)) {
      // for each item in model, regardless of key
      values(model).forEach((item) => {
        // is an object?
        if (item && (typeof item === 'object')) {
          // are there sub-models
          if (item['models']) {
            // the decorate this item
            log('applying decorator(s) to list:', item);
            this.maybeDecorateItem(item, particle);
          } else {
            // otherwise, check if there are sub-items to decorate
            if (model?.filter || model?.decorator || model?.collateBy) {
              log('scanning for lists in sub-model:', item);
              this.maybeDecorateModel(item, particle);
            }
          }
        }
      });
    }
    // possibly decorated model
    return model;
  },
  maybeDecorateItem(item, particle) {
    let models = (typeof item.models === 'string') ? this.getOpaqueData(item.models) : item.models;
    // do a decorator
    models = maybeDecorate(models, item.decorator, particle);
    // do a filter
    models = maybeFilter(models, item.filter, particle.impl);
    // do a collator
    models = maybeCollateBy(models, item);
    // mutate items
    item.models = models;
    //console.log(JSON.stringify(models, null, '  '));
  },
};

const maybeDecorate = (models, decorator, particle) => {
  decorator = particle.impl[decorator] ?? decorator;
  const {inputs, state} = particle.internal;
  if (decorator) {
    // we don't want the decorator to have access to mutable globals
    const immutableState  = Object.freeze(deepCopy(state));
    // models become decorous
    models = models.map(model => {
      // use previously mutated data or initialize
      // TODO(cromwellian): I'd like to do Object.freeze() here
      model.privateData = model.privateData || {};
      const decorated = decorator(model, inputs, immutableState);
      // set new privateData from returned
      model.privateData = decorated.privateData;
      return {...decorated, ...model};
    });
    // sort (possible that all values undefined)
    models.sort(sortByLc('sortKey'));
    log('decoration was performed');
  }
  //models.forEach(model => delete model.privateData);
  return models;
};

const maybeFilter = (models, filter, impl) => {
  filter = impl[filter] ?? filter;
  if (filter && models) {
    // models become filtrated
    models = models.filter(filter);
  }
  return models;
};

const maybeCollateBy = (models, item) => {
  // construct requested sub-lists
  entries(item).forEach(([name, collator]) => {
    // generate named collations for items of the form `[name]: {collateBy}`
    if (collator?.['collateBy']) {
      // group the models into buckets based on the model-field named by `collateBy`
      const collation = collate(models, collator['collateBy']);
      models = collationToRenderModels(collation, name, collator['$template']);
    }
  });
  return models;
};

const sortByLc = key => (a, b) => sort(String(a[key]).toLowerCase(), String(b[key]).toLowerCase());
//const sortBy = key => (a, b) => sort(a[key], b[key]);
const sort = (a, b) => a < b ? -1 : a > b ? 1 : 0;

const collate = (models, collateBy) => {
  const collation = {};
  models.forEach(model => {
    const keyValue = model[collateBy];
    if (keyValue) {
      const category = collation[keyValue] || (collation[keyValue] = []);
      category.push(model);
    }
  });
  return collation;
};

const collationToRenderModels = (collation, name, $template) => {
  return entries(collation).map(([key, models]) => ({
    key,
    [name]: {models, $template},
    single: !(models['length'] !== 1),
    ...models?.[0]
  }));
};
