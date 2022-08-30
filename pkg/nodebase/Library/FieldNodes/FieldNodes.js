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
      $type: 'String',
      $value: 'text field'
    },
    value: {
      $type: 'String',
      $value: 'value'
    }
  },
  field: {
    $kind: '$app/Library/FieldNodes/TextField',
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
      $type: 'String',
      $value: 'boolean field'
    },
    value: {
      $type: 'Boolean'
    }
  },
  field: {
    $kind: '$app/Library/FieldNodes/BooleanField',
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
      $type: 'String',
      $value: 'static text'
    },
    textStyle: {
      $type: 'String',
      $value: 'font-weight: bold; color: red; font-size: 18px;'
    }
  },
  text: {
    $kind: '$app/Library/FieldNodes/TextObject',
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
    $kind: '$app/Library/FieldNodes/LineObject',
    $inputs: ['lineStyle']
  }
};

export const ImageObject = {
  $meta: {
    name: 'Image',
    category: 'Object'
  },
  $stores: {
    inputStream: {
      $type: 'Stream',
      $value: {
        id: 'default',
        version: 0
      }
    },
    image: {
      $type: 'Image',
      $value: {
        url: 'https://storage.googleapis.com/tfweb/testpics/strawberry2.jpeg',
        canvas: {
          id: 0,
          version: 0
        }
      }
    }
  },
  field: {
    $kind: '$library/NewMedia/Image',
    $inputs: ['image']
  }
};