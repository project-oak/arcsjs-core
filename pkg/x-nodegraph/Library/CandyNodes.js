/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Sugar = {
  $meta: {
    id: 'sugar',
    category: 'Input',
  },
  $stores: {
    sugar: {
      $type: 'Glucose',
      noinspect: true
    }
  },
  Sugar: {
    $kind: '$library/Media/OutputImage',
    $staticInputs: {
      image: {url: `assets/glucose.png`}
    },
    $outputs: ['sugar']
  }
};

export const Melting = {
  $meta: {
    id: 'Melting',
    category: 'Effect',
  },
  $stores: {
    sugar: {
      $type: 'Glucose',
      noinspect: true
    },
    candy: {
      $type: 'Candy',
      connection: true,
      multiple: true
    }
  },
  melting: {
    $kind: '$app/Library/Noop',
    $inputs: ['candy'],
    $outputs: ['sugar']
  }
};

export const Lollipop = {
  $meta: {
    id: 'Lollipop',
    category: 'Model',
  },
  $stores: {
    sugar: {
      $type: 'Glucose',
      connection: true
    },
    candy: {
      $type: 'Candy',
      noinspect: true
    }
  },
  sweet: {
    $kind: '$library/Media/OutputImage',
    $staticInputs: {
      image: {url: `assets/lollipop.png`}
    },
    $inputs: ['sugar'],
    $outputs: ['candy']
  },
  // TODO(mariakleiner): explore move/resize for recipes with multiple particles
  // sour: {
  //   $kind: '$library/Media/OutputImage',
  //   $staticInputs: {
  //     image: {url: './assets/lollipop.png'}
  //   },
  //   $inputs: ['sugar'],
  //   $outputs: ['candy']
  // }
};

export const CottonCandy = {
  $meta: {
    id: 'Cotton Candy',
    category: 'Model',
  },
  $stores: {
    sugar: {
      $type: 'Glucose',
      connection: true
    },
    candy: {
      $type: 'Candy',
      noinspect: true
    }
  },
  CottonCandy: {
    $kind: '$library/Media/OutputImage',
    $staticInputs: {
      image: {url: `assets/cottoncandy.png`}
    },
    $inputs: ['sugar'],
    $outputs: ['candy']
  }
};
