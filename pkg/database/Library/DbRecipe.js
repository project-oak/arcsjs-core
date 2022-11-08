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
    selectedRecord: {
      $type: 'Pojo'
    },
    selectedRecordIds: {
      $type: 'Pojo'
    },
    viewMode: {
      $type: 'String',
      $value: 'details'
    }
  },
  database: {
    $kind: '$db/DbHome',
    $inputs: ['viewMode'],
    $slots: {
      chooser: {
        viewChooser: {
          $kind: '$db/ViewChooser',
          $inputs: ['viewMode'],
          $outputs: ['viewMode']
        }
      },
      navigator: {
        recordsNavigator: {
          $kind: '$db/Navigator',
          $inputs: [
            'props',
            'records',
            'selectedRecord',
            'selectedRecordIds',
            'viewMode'
          ],
          $outputs: [
            'records',
            'selectedRecord',
            'viewMode'
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
            'viewMode'
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
