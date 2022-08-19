export const LobbyRecipe = {
  $meta: {
    name: "LobbyRecipe"
  },
  $stores: {
    persona: {
      $type: 'Persona'
    }
  },
  lobby: {
    $kind: '$app/Lobby',
    $inputs: ['persona']
  }
};