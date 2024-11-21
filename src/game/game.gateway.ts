import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SOCKET_EVENTS } from '../../shared/constants';

interface GameInvite {
  from: string;
  to: string;
}

interface GameState {
  board: string[];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  players: { [key: string]: string };
  status: 'waiting' | 'in-progress' | 'finished';
  gameId?: string;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private games: Map<string, GameState> = new Map();
  private activeGames: Map<string, string> = new Map(); // userId -> gameId
  private onlineUsers: Map<string, string> = new Map(); // socketId -> userId

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = this.onlineUsers.get(client.id);
    if (userId) {
      this.onlineUsers.delete(client.id);
      this.broadcastOnlineUsers();
    }
  }

  @SubscribeMessage(SOCKET_EVENTS.USER_CONNECTED)
  async handleUserConnected(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string }
  ) {
    console.log('User connected:', data.userId);
    this.onlineUsers.set(client.id, data.userId);
    this.broadcastOnlineUsers();
  }

  @SubscribeMessage(SOCKET_EVENTS.SEND_GAME_INVITE)
  async handleGameInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: GameInvite,
  ) {
    console.log('Game invite:', data);

    const targetSocketId = Array.from(this.onlineUsers.entries())
      .find(([_, userId]) => userId === data.to)?.[0];

    if (!targetSocketId) {
      client.emit(SOCKET_EVENTS.GAME_ERROR, {
        message: 'Target player not found or offline',
      });
      return;
    }

    const gameId = 'game_' + Date.now();

    // Initialize waiting game state
    const initialGameState: GameState = {
      board: Array(9).fill(''),
      currentPlayer: '',
      winner: null,
      isGameOver: false,
      players: {
        [data.from]: '',
        [data.to]: '',
      },
      status: 'waiting',
      gameId
    };

    this.games.set(gameId, initialGameState);

    // Emit invitation to the target player using their socket ID
    this.server.to(targetSocketId).emit(SOCKET_EVENTS.GAME_INVITE, {
      gameId,
      from: data.from,
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.ACCEPT_GAME_INVITE)
  async handleAcceptInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; playerId: string },
  ) {
    console.log('Backend received accept invite:', data);
    console.log('Current games:', Array.from(this.games.entries()));

    const game = this.games.get(data.gameId);
    if (!game) {
      console.log('Game not found:', data.gameId);
      client.emit(SOCKET_EVENTS.GAME_ERROR, { message: 'Game not found' });
      return;
    }

    console.log('Found game:', game);

    // Initialize game state for Tic-tac-toe
    const gameState: GameState = {
      board: Array(9).fill(''),
      currentPlayer: 'X',
      winner: null,
      isGameOver: false,
      players: {},
      status: 'in-progress',
      gameId: data.gameId
    };

    // Assign X and O to players
    const players = Object.keys(game.players);
    console.log('Players in game:', players);

    gameState.players[players[0]] = 'X';
    gameState.players[players[1]] = 'O';

    console.log('Initialized game state:', gameState);

    // Update game in memory
    this.games.set(data.gameId, gameState);

    // Store active game reference
    players.forEach(playerId => {
      this.activeGames.set(playerId, data.gameId);
    });

    // Find socket IDs for both players
    const playerSockets = players
      .map(playerId => {
        const socketId = Array.from(this.onlineUsers.entries())
          .find(([_, userId]) => userId === playerId)?.[0];
        console.log(`Found socket for player ${playerId}:`, socketId);
        return socketId;
      })
      .filter(socketId => socketId);

    console.log('Player sockets to notify:', playerSockets);

    // Notify all players about game start
    playerSockets.forEach(socketId => {
      if (socketId) {
        console.log('Emitting game started to socket:', socketId);
        this.server.to(socketId).emit(SOCKET_EVENTS.GAME_STARTED, gameState);
      }
    });
  }

  @SubscribeMessage(SOCKET_EVENTS.MAKE_MOVE)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; playerId: string; position: number },
  ) {
    const game = this.games.get(data.gameId);
    if (!game) {
      client.emit(SOCKET_EVENTS.GAME_ERROR, { message: 'Game not found' });
      return;
    }

    // Validate move
    if (
      game.board[data.position] ||
      game.isGameOver ||
      game.players[data.playerId] !== game.currentPlayer
    ) {
      client.emit(SOCKET_EVENTS.GAME_ERROR, { message: 'Invalid move' });
      return;
    }

    // Make move
    game.board[data.position] = game.players[data.playerId];

    // Check for win or draw
    const winner = this.checkWinner(game.board);
    if (winner) {
      game.winner = winner;
      game.isGameOver = true;
      game.status = 'finished';
    } else if (this.isDraw(game.board)) {
      game.isGameOver = true;
      game.status = 'finished';
    } else {
      // Switch turns
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
    }

    // Update game state
    this.games.set(data.gameId, game);

    // Notify all players
    Object.keys(game.players).forEach(playerId => {
      const socketId = Array.from(this.onlineUsers.entries())
        .find(([_, userId]) => userId === playerId)?.[0];
      if (socketId) {
        this.server.to(socketId).emit(SOCKET_EVENTS.MOVE_MADE, game);
      }
    });

    // If game is over, clean up
    if (game.isGameOver) {
      Object.keys(game.players).forEach(playerId => {
        this.activeGames.delete(playerId);
      });
      this.games.delete(data.gameId);
    }
  }

  private checkWinner(board: string[]): string | null {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  private isDraw(board: string[]): boolean {
    return board.every(cell => cell !== '');
  }

  private broadcastOnlineUsers() {
    const users = Array.from(this.onlineUsers.values());
    this.server.emit(SOCKET_EVENTS.ONLINE_USERS, { users });
  }

  @SubscribeMessage(SOCKET_EVENTS.END_GAME)
  async handleEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; winner: string },
  ) {
    const game = this.games.get(data.gameId);
    if (!game) return;

    game.status = 'finished';

    // Clean up game references
    Object.keys(game.players).forEach((playerId) => {
      this.activeGames.delete(playerId);
    });

    // Notify all players about game end
    this.server.to(data.gameId).emit(SOCKET_EVENTS.GAME_ENDED, {
      gameId: data.gameId,
      winner: data.winner,
    });

    // Remove the game from memory
    this.games.delete(data.gameId);
  }

  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.values());
  }
}
