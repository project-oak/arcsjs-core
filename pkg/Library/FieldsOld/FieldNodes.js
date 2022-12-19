/**
 * @license
 * Copyright (c) 2022 Google LLC All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
export * from './MultilineTextFieldNode.js';

export const TextFieldNode = {
  $meta: {
    id: 'Text',
    category: 'Field'
  },
  $stores: {
    label: {
      $type: 'String',
      $value: 'text field'
    },
    value: {
      $type: 'String',
      $value: 'value'
    },
    moar: {
      $type: 'String',
      $value: 'value'
    }
  },
  field: {
    $kind: '$library/Fields/TextField',
    $inputs: ['label', 'value'],
    $outputs: ['label', 'value', 'moar']
  }
};

export const BooleanField = {
  $meta: {
    id: 'Boolean',
    category: 'Field'
  },
  $stores: {
    label: {
      $type: 'String',
      $value: 'boolean field'
    },
    value: {
      $type: 'Boolean'
    },
    moar: {
      $type: 'String',
      $value: 'value'
    },
    moar2: {
      $type: 'String',
      $value: 'value'
    }
  },
  field: {
    $kind: '$library/Fields/BooleanField',
    $inputs: ['label', 'value'],
    $outputs: ['label', 'value', 'moar', 'moar2']
  }
};

export const StaticText = {
  $meta: {
    id: 'StaticText',
    displayName: 'Static Text',
    category: 'Field'
  },
  $stores: {
    text: {
      $type: 'String',
      $value: 'static text',
      connection: true
    },
    textStyle: {
      $type: 'String',
      $value: 'font-weight: bold; color: red; font-size: 18px;',
      connection: true
    }
  },
  text: {
    $kind: '$library/Fields/TextObject',
    $inputs: ['text', 'textStyle']
  }
};

export const LineObject = {
  $meta: {
    id: 'LineObject',
    category: 'Field',
  },
  $stores: {
    lineStyle: {
      $type: 'String'
    }
  },
  field: {
    $kind: '$library/Fields/LineObject',
    $inputs: ['lineStyle']
  }
};
