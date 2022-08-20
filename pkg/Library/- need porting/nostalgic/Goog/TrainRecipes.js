/**
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

export const FindTrainTicketsRecipe = {
  $meta: {
    description: 'Train Tickets',
    name: 'TrainTickets',
    devices: 'builder,phone',
    group: 'meta'
  },
  $stores: {
    Geolocation: {
      $type: `Geolocation`
    },
    transcript: {
      $type: 'Transcript'
    },
    ticketsInfo: {
      $type: 'Tickets'
    },
    textForSpeech: {
      $type: 'String'
    }
  },
  FindTrainTickets: {
    $kind: `Goog/FindTrainTickets`,
    $bindings: {
      Geolocation: '',
      transcript: '',
    }
  },
  Tickets2Text: {
    $kind: `Goog/Tickets2Text`,
    $bindings: {
      ticketsInfo: '',
      textForSpeech: ''
    }
  }
};

export const TrainTicketsDisplayRecipe = {
  $meta: {
    description: 'TrainTicketsDisplay',
    name: 'TrainTicketsDisplay',
    devices: 'watch'
  },
  $stores: {
    ticketsInfo: {
      $type: 'Tickets'
    },
    url: {
      $type: 'String',
      $tags: ['shared']
    }
  },
  TrainTicketsDisplay: {
    $container: 'main#screen',
    $kind: `Goog/TrainTicketsDisplay`,
    $bindings: {
      ticketsInfo: '',
      url: ''
    }
  }
};

export const TrainTicketsQueryRecipe = {
  $meta: {
    description: 'TrainTicketsQuery',
    name: 'TrainTicketsQuery',
    devices: ['smartscreen', 'builder', 'phone']
  },
  $stores: {
    ticketsInfo: {
      $type: 'Tickets'
    }
  },
  trainQuery: {
    $container: 'main#screen',
    $kind: 'Goog/TrainTicketsQuery',
    $bindings: {
      ticketsInfo: '',
    }
  }
};
