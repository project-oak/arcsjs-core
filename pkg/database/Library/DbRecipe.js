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
    }
  },
  database: {
    $kind: '$db/DbHome',
    $slots: {
      navigator: {
        recordsNavigator: {
          $kind: '$db/Navigator',
          $inputs: ['props', 'records', 'selectedRecord'],
          $outputs: ['selectedRecord']
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
            {record: 'selectedRecord'},
            'records'
          ],
          $outputs: [
            'records',
            {record: 'selectedRecord'}
          ]
        }
      }
    }
  }
};
