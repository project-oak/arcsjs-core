import {petProps as props, pets as records, petFormParticleKind as formParticleKind} from './pets.js';

//export
const DbNode = {
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
    selectedRecord: {
      $type: 'Pojo'
    },
    selectedRecordIds: {
      $type: 'Pojo'
    }
  },
  database: {
    $kind: '$db/DbHome',
    $inputs: ['selectedRecord'],
    $slots: {
      navigator: {
        recordsNavigator: {
          $kind: '$db/Navigator',
          $inputs: [
            'props',
            'records',
            'selectedRecord',
            'selectedRecordIds',
          ],
          $outputs: [
            'records',
            'selectedRecord',
          ]
        }
      },
      recordsViewer: {
        RecordsViewer: {
          $kind: '$db/PetsViewer',
          $inputs: ['records'],
          $outputs: [
            'selectedRecord',
            'selectedRecordIds',
          ]
        }
      },
      form: {
        RecordForm: {
          $kind: formParticleKind,
          $inputs: [{record: 'selectedRecord'}],
          $outputs: [{record: 'selectedRecord'}]
        }
      }
    }
  }
};

export const dbNodeTypes = {DbNode};

export const dbGraph = {
  $meta: {
    id: 'database-app',
    name: 'database-app'
  },
  nodes: [{
    type: 'DbNode'
  }]
};
