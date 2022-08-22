/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file or at
 * https://developers.google.com/open-source/licenses/bsd
 */

const publicPipelinesUrl = `https://arcsjs.firebaseio.com/pipelines`;

export const PipelinesToolbar = {
  $kind: '$library/NodeGraph/PipelineToolbar',
  $inputs: [
    {pipeline: 'selectedPipeline'},
    'pipelines'
  ],
  $staticInputs: {
    publicPipelinesUrl: `${publicPipelinesUrl}/`
  },
  $outputs: [
    {pipeline: 'selectedPipeline'},
    'pipelines'
  ],
  $slots: {
    chooser: {
      $stores: {
        pipelines: {
          $type: '[JSON]',
          $tags: ['persisted'],
          $value: []
        },
        selectedPipeline: {
          $type: 'JSON',
          $tags: ['persisted'],
          $value: null
        }
      },
      PipelineChooser: {
        $kind: '$library/NodeGraph/PipelineChooser',
        $inputs: [
          {pipeline: 'selectedPipeline'},
          'pipelines'
        ],
        $outputs: [{pipeline: 'selectedPipeline'}],
        $staticInputs: {
          publicPipelinesUrl: null // `${publicPipelinesUrl}.json` //'https://arcsjs.firebaseio.com/pipelines.json'
        }
      }
    }
  }
};