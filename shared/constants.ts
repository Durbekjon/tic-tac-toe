export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect' as const,
  DISCONNECT: 'disconnect' as const,
  USER_CONNECTED: 'userConnected' as const,
  ONLINE_USERS: 'onlineUsers' as const,
  
  // Game invitation events
  SEND_GAME_INVITE: 'sendGameInvite' as const,
  GAME_INVITE: 'gameInvite' as const,
  ACCEPT_INVITE: 'acceptInvite' as const,
  
  // Game state events
  MAKE_MOVE: 'makeMove' as const,
  MOVE_MADE: 'moveMade' as const,
  GAME_STARTED: 'gameStarted' as const,
  GAME_ENDED: 'gameEnded' as const,
  GAME_STATE_UPDATED: 'gameStateUpdated' as const,
  END_GAME: 'endGame' as const,
  
  // User status events
  USER_STATUS_UPDATED: 'userStatusUpdated' as const,
  ALL_USER_STATUSES: 'allUserStatuses' as const,
  
  // Spectator mode events
  JOIN_AS_SPECTATOR: 'joinAsSpectator' as const,
  
  // Error events
  GAME_ERROR: 'gameError' as const,
} as const;
