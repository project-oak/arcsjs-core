import {petProps as props, pets as records, petFormParticleKind as formParticleKind} from './pets.js';

export const DbRecipe = {
  $meta: {
    description: 'Arcs Database Recipe'
  },
  $stores: {
    props: {
      $type: '[Pojo]',
      $value: props
    },
    records: {
      $type: '[Pojo]',
      $value: records
    },
    recordEvent: {
      $type: 'Pojo' // {type: new/view/save/delete, record}
    }
  },
  database: {
    $kind: '$db/DbHome',
    $slots: {
      navigator: {
        recordsNavigator: {
          $kind: '$db/Navigator',
          $inputs: [
            'props',
            'records',
            {'event': 'recordEvent'}
          ],
          $outputs: [{'event': 'recordEvent'}]
        }
      },
      // recordsViewer: {
      //   RecordsViewer: {
      //     $kind: '$db/PetsViewer',
      //     $inputs: ['records'],
      // },
      form: {
        RecordForm: {
          $kind: formParticleKind,
          $inputs: [
            'props',
            {event: 'recordEvent'}
          ],
          $outputs: [{event: 'recordEvent'}]
        }
      }
    }
  },
  recordsManager: {
    $kind: '$db/RecordsManager',
    $inputs: [
      'records',
      {event: 'recordEvent'}
    ],
    $outputs: [
      'records',
      {event: 'recordEvent'}
    ]
  }
};
