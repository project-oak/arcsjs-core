export const LobbyRecipe = {
  $meta: {
    name: "LobbyRecipe"
  },
  $stores: {
    persona: {
      $type: 'Persona',
      $tags: ['persisted']
    },
    strangers: {
      $type: '[Stranger]'
    },
    callees: {
      $type: '[Callee]'
    }
  },
  lobby: {
    $kind: '$app/Library/Lobby',
    $inputs: ['persona', 'strangers', 'callees'],
    $outputs: ['callees'],
    $slots: {
      profile: {
        persona: {
          $kind: '$library/User/Profile',
          $inputs: ['persona'],
          $outputs: ['persona']
        }
      }
    }
  }
};