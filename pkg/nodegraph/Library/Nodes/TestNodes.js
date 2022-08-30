/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

export const Test = {
  $meta: {
    name: 'test',
    category: 'test'
  },
  $stores: {
    // Primitive types with/without default values / values.
    theString: {
      $type: 'String'
    },
    stringWithDefault: {
      $type: 'String',
      $value: 'hello world!'
    },
    stringWithValues: {
      $type: 'String',
      values: ['this', 'or', 'that?']
    },
    theNumber: {
      $type: 'Number'
    },
    numberWithDefault: {
      $type: 'Number',
      $value: 42
    },
    numberWithRange: {
      $type: 'Number',
      range: {min: 0, max: 10, step: 0.5}
    },
    numberWithValues: {
      $type: 'Number',
      values: [123, 234, 456]
    },
    theBoolean: {
      $type: 'Boolean'
    },
    booleanDefaultFalse: {
      $type: 'Boolean',
      $value: false
    },
    booleanDefaultTrue: {
      $type: 'Boolean',
      $value: true
    },
    // Object
    theObject: {
      $type: 'JSON',
      $value: {
        strField: 'ABC',
        numField: 1984,
        falseField: false,
        trueField: true,
        nested: {
          nestedStrField: 'def',
          nestedNumField: 33,
          nestedFalseField: false,
          nestedTrueField: true,
          nestedObj: {
            nnStrField: 'xyz',
            nnNumField: 5,
            nnFalseField: false,
            nnTrueField: true,
          }
        }
      }
    },
    selectedNode: {
      $type: 'JSON',
      noinspect: true,
      connection: true
    }
  },
  test: {
    $kind: '$app/nodegraph/Library/Test',
    $inputs: [
      'theString',
      'stringWithDefault',
      'stringWithValues',
      'theNumber',
      'numberWithRange',
      'numberWithDefault',
      'numberWithValues',
      'theBoolean',
      'booleanDefaultFalse',
      'booleanDefaultTrue',
      'theObject',
      'selectedNode'
    ],
    $outputs: [
      'theString',
      'numberWithDefault',
      'booleanDefaultTrue',
      'theObject',
    ]
  }
};

export const TestStrList = {
  $meta: {
    name: 'test strings list',
    category: 'test'
  },
  $stores: {
    stringsList: {
      $type: '[String]',
      $value: ['a', 'bb', 'ccc']
    },
  },
  test: {
    $kind: '$app/nodegraph/Library/Noop',
  }
};

export const TestObjList = {
  $meta: {
    name: 'test objects list',
    category: 'test'
  },
  $stores: {
    objectsList: {
      $type: '[JSON]',
      $value: [{foo: 'bar'}, {foo: 'baz'}, {foo: 'qux'}]
    },
  },
  test: {
    $kind: '$app/nodegraph/Library/Noop',
  }
};

export const InspectedTest = {
  $meta: {
    name: 'inspected test',
    category: 'test'
  },
  $stores: {
    txt: {
      $type: 'String',
      $value: 'foo'
    },
    object1: {
      $type: 'MyTestObject',
      $value: {
        hello: 'hello',
        world: 'world'
      },
    },
    someObjects: {
      $type: '[MyTestObject]',
      $value: [{
        hello: 'shalom',
        world: 'olam'
      }, {
        hello: 'hola',
        world: 'mundo'
      }],
      noinspect: true
    },
    object2: {
      $type: 'JSON',
      $value: {
        foo: 'bar',
        baz: 'quz'
      },
      noinspect: true
    }
  },
  testInspected: {
    $kind: '$app/nodegraph/Library/Noop',
  }
};
