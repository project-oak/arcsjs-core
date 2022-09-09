export const LobbyRecipe = {
  $meta: {
    name: "LobbyRecipe"
  },
  $stores: {
    group: {
      $type: 'String',
      $tags: ['persisted']
    },
    profile: {
      $type: 'Pojo',
      noinspect: true
    },
    persona: {
      $type: 'Persona',
      noinspect: true
    },
    stream: {
      $type: 'Stream',
      noinspect: true
    },
    stream2: {
      $type: 'Stream',
      noinspect: true
    },
    stream3: {
      $type: 'Stream',
      noinspect: true
    },
    stream4: {
      $type: 'Stream',
      noinspect: true
    },
    returnStream: {
      $type: 'Stream',
      connection: true
    }
  },
  lobby: {
    $kind: '$library/Rtc/Lobby',
    $inputs: ['persona', 'returnStream', 'group'],
    $outputs: ['stream', 'stream2', 'stream3', 'stream4']
  }
};