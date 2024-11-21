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
    origin: ['http://localhost:4200', 'https://tic-tac-toe-ij1b.onrender.com'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
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
    
    // Immediately send the current list of online users back to the connected client
    client.emit(SOCKET_EVENTS.ONLINE_USERS, this.getOnlineUsers());
  }

  private broadcastOnlineUsers() {
    const users = this.getOnlineUsers();
    console.log('Broadcasting online users:', users);
    this.server.emit(SOCKET_EVENTS.ONLINE_USERS, users);
  }

  private getOnlineUsers(): string[] {
    const uniqueUsers = new Set(this.onlineUsers.values());
    return Array.from(uniqueUsers);
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
      currentPlayer: data.from, // Set the inviter as the first player
      winner: null,
      isGameOver: false,
      players: {
        [data.from]: 'X',
        [data.to]: 'O',
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

  @SubscribeMessage(SOCKET_EVENTS.ACCEPT_INVITE)
  async handleAcceptInvite(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; playerId: string },
  ) {
    const game = this.games.get(data.gameId);
    if (!game) {
      client.emit(SOCKET_EVENTS.GAME_ERROR, {
        message: 'Game not found',
      });
      return;
    }

    game.status = 'in-progress';
    this.games.set(data.gameId, game);

    // Add both players to the active games map
    const players = Object.keys(game.players);
    players.forEach(playerId => {
      this.activeGames.set(playerId, data.gameId);
    });

    // Broadcast the updated game state to both players
    this.server.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, game);
  }

  @SubscribeMessage(SOCKET_EVENTS.MAKE_MOVE)
  async handleMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; playerId: string; position: number },
  ) {
    const game = this.games.get(data.gameId);
    if (!game || game.status !== 'in-progress') {
      client.emit(SOCKET_EVENTS.GAME_ERROR, {
        message: 'Invalid game or game not in progress',
      });
      return;
    }

    if (game.currentPlayer !== data.playerId) {
      client.emit(SOCKET_EVENTS.GAME_ERROR, {
        message: 'Not your turn',
      });
      return;
    }

    if (game.board[data.position] !== '') {
      client.emit(SOCKET_EVENTS.GAME_ERROR, {
        message: 'Position already taken',
      });
      return;
    }

    // Make the move
    game.board[data.position] = game.players[data.playerId];

    // Check for winner
    const winner = this.checkWinner(game.board);
    if (winner) {
      game.winner = data.playerId;
      game.isGameOver = true;
      game.status = 'finished';
    } else if (this.isDraw(game.board)) {
      game.isGameOver = true;
      game.status = 'finished';
    } else {
      // Switch turns
      const players = Object.keys(game.players);
      game.currentPlayer = players.find(id => id !== data.playerId)!;
    }

    this.games.set(data.gameId, game);

    // Broadcast the updated game state
    this.server.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, game);
  }

  private checkWinner(board: string[]): string | null {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
      [0, 4, 8], [2, 4, 6] // Diagonals
    ];

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  }

  private isDraw(board: string[]): boolean {
    return board.every(cell => cell !== '');
  }

  @SubscribeMessage(SOCKET_EVENTS.END_GAME)
  async handleEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { gameId: string; winner: string },
  ) {
    const game = this.games.get(data.gameId);
    if (!game) {
      return;
    }

    game.winner = data.winner;
    game.isGameOver = true;
    game.status = 'finished';

    this.games.set(data.gameId, game);

    // Remove the game from active games
    Object.keys(game.players).forEach(playerId => {
      this.activeGames.delete(playerId);
    });

    // Broadcast the final game state
    this.server.emit(SOCKET_EVENTS.GAME_STATE_UPDATED, game);
  }
}
