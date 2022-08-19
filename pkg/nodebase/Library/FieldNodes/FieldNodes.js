/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const TextField = {
  $meta: {
    name: 'Text',
    category: 'Field'
  },
  $stores: {
    label: {
      $type: 'String'
    },
    value: {
      $type: 'String'
    }
  },
  field: {
    $kind: '$app/nodebase/Library/FieldNodes/TextField',
    $inputs: ['label', 'value'],
    $outputs: ['label', 'value']
  }
};

export const BooleanField = {
  $meta: {
    name: 'Boolean',
    category: 'Field'
  },
  $stores: {
    label: {
      $type: 'String'
    },
    value: {
      $type: 'Boolean'
    }
  },
  field: {
    $kind: '$app/nodebase/Library/FieldNodes/BooleanField',
    $inputs: ['label', 'value'],
    $outputs: ['label', 'value']
  }
};

export const TextObject = {
  $meta: {
    name: 'StaticText',
    category: 'Object'
  },
  $stores: {
    text: {
      $type: 'String'
    },
    textStyle: {
      $type: 'String'
    }
  },
  text: {
    $kind: '$app/nodebase/Library/FieldNodes/TextObject',
    $inputs: ['text', 'textStyle']
  }
};

export const LineObject = {
  $meta: {
    name: 'Line',
    category: 'Object'
  },
  $stores: {
    lineStyle: {
      $type: 'String'
    }
  },
  field: {
    $kind: '$app/nodebase/Library/FieldNodes/LineObject',
    $inputs: ['lineStyle']
  }
};