export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  USER_CONNECTED: 'userConnected',
  ONLINE_USERS: 'onlineUsers',
  
  // Game invitation events
  SEND_GAME_INVITE: 'sendGameInvite',
  GAME_INVITE: 'gameInvite',
  ACCEPT_GAME_INVITE: 'acceptGameInvite',
  DECLINE_GAME_INVITE: 'declineGameInvite',
  
  // Game state events
  GAME_STARTED: 'gameStarted',
  MAKE_MOVE: 'makeMove',
  MOVE_MADE: 'moveMade',
  GAME_ENDED: 'gameEnded',
  END_GAME: 'endGame',
  
  // Error events
  GAME_ERROR: 'gameError'
} as const;
