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
    // selectedRecord: {
    //   $type: 'Pojo'
    // }
    selectRecordEvent: {
      $type: 'Pojo' // {type: new/view, record}
    },
    modifyRecordEvent: {
      $type: 'Pojo' // {type: save/delete, record}
    }
  },
  database: {
    $kind: '$db/DbHome',
    $slots: {
      navigator: {
        recordsNavigator: {
          $kind: '$db/Navigator',
          $inputs: ['props', 'records', 'modifyRecordEvent'], //'selectedRecord'],
          $outputs: ['selectRecordEvent']
          // $outputs: ['selectedRecord']
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
            // {record: 'selectedRecord'},
            // 'records'
            {event: 'selectRecordEvent'}
          ],
          $outputs: [
            // 'records',
            // {record: 'selectedRecord'}
            {event: 'modifyRecordEvent'}
          ]
        }
      }
    }
  },
  recordsManager: {
    $kind: '$db/RecordsManager',
    $inputs: [
      'records',
      {event: 'modifyRecordEvent'}
    ],
    $outputs: [
      'records',
      {event: 'modifyRecordEvent'}
    ]
  }
};
