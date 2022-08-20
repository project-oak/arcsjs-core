/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

import {VoiceCaptureParticle} from '../Media/FeedRecipes.js';
import {createHubModelRecipe} from '../Actions/HubModelRecipes.js';
import {models} from '../App/models.js';

const findModelByDescription = (description) => {
  return models.find(m => m.description === description);
};
const hubModelRecipe = createHubModelRecipe(findModelByDescription('Common plants'));

export const FindPlantInfoRecipe = {
  $meta: {
    description: 'Find information about plants',
    name: 'PlantInfo',
    devices: 'smartscreen, builder'
  },
  $stores: {
    ...hubModelRecipe.$stores,
    plantInfo: {
      $type: 'JSON',
    },
    text: {
      $type: 'String'
    },
    url: {
      $type: 'String',
      $tags: ['shared']
    }
  },
  Classifier: hubModelRecipe.Classifier,
  ClassifierResultToQuery: {
    $kind: `Goog/ClassifierResultToQuery`,
    $bindings: {
      classifierResults: '',
      text: '',
      info: 'plantInfo',
    }
  },
  search: {
    $kind: 'Goog/SearchForThing',
    $bindings: {
      query: 'text',
      url: ''
    },
    $staticInputs: {
      searchUrl: 'https://en.wikipedia.org/wiki/'
    }
  }
};

export const PlantQuery = {
  $meta: {
    description: 'Ask about a plant',
    name: 'PlantQuery',
    devices: 'builder',
  },
  $stores: {
    boxSelection: {
      $type: 'Box'
    },
    transcript: {
      $type: 'Transcript'
    }
  },
  queryPlant: {
    ...VoiceCaptureParticle,
    $staticInputs: {
      phrase: 'what is it',
    }
  }
};

export const PlantInfoDisplay = {
  $meta: {
    description: 'Find information about plants',
    name: 'PlantInfo',
    group: 'basic'
  },
  $stores: {
    plantInfo: {
      $type: 'JSON'
    }
  },
  display: {
    $container: 'ClassifierScrim#details',
    $kind: `Goog/PoisonousPlantDisplay`,
    $bindings: {
      plantInfo: ''
    }
  }
};

export const PlantWarning = {
  $meta: {
    description: 'Warning for a poisonous plant',
    name: 'PlantWarning',
    group: 'basic',
    devices: 'smartscreen, builder'
  },
  $stores: {
    plantInfo: {
      $type: 'JSON'
    },
    textForSpeech: {
      $type: 'String',
      $tags: ['shared']
    }
  },
  plantWarning: {
    $kind: 'Goog/PlantWarning',
    $bindings: {
      plantInfo: '',
      textForSpeech: ''
    }
  }
};

export const IsPoisonous = {
  $meta: {
    description: 'Find out if the plant is poisonous',
    name: 'IsPoisonous',
    group: 'basic',
    devices: 'builder, smartscreen'
  },
  $stores: {
    classifierResults: {
      $type: '[ClassifierResults]'
    },
    plantInfo: {
      $type: 'JSON'
    }
  },
  isPoisonous: {
    $kind: 'Goog/IsPoisonous',
    $bindings: {
      plantInfo: ''
    }
  }
};