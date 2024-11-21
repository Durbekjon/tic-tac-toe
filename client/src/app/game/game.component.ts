import { Component, OnInit, OnDestroy } from '@angular/core';
import { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { SOCKET_EVENTS } from '../../../../shared/constants';
import { GameState } from './interfaces/game.interface';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit, OnDestroy {
  private socket: Socket;
  currentPlayerId: string = 'player_' + Math.random().toString(36).substr(2, 9);
  pendingInvite: any = null;
  activeGameId: string = '';
  gameState: GameState = {
    board: Array(9).fill(''),
    currentPlayer: 'X',
    winner: null,
    isGameOver: false,
    players: {},
    status: 'waiting'
  };
  onlineUsers: string[] = [];
  protected readonly Object = Object;

  constructor() {
    this.socket = io(environment.wsUrl);
  }

  ngOnInit() {
    this.setupSocketListeners();
    this.connectUser();
  }

  ngOnDestroy() {
    this.socket.disconnect();
  }

  private connectUser() {
    this.socket.emit(SOCKET_EVENTS.USER_CONNECTED, { userId: this.currentPlayerId });
  }

  private setupSocketListeners() {
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log('Connected to server');
      this.connectUser();
    });

    this.socket.on(SOCKET_EVENTS.ONLINE_USERS, (data: { users: string[] }) => {
      this.onlineUsers = data.users.filter(id => id !== this.currentPlayerId);
    });

    this.socket.on(SOCKET_EVENTS.GAME_INVITE, (data: { gameId: string, from: string }) => {
      console.log('Received game invite:', data);
      this.pendingInvite = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_STARTED, (data: GameState & { gameId: string }) => {
      console.log('Game started:', data);
      this.gameState = data;
      this.activeGameId = data.gameId;
      this.pendingInvite = null;
    });

    this.socket.on(SOCKET_EVENTS.MOVE_MADE, (data: GameState) => {
      console.log('Move made:', data);
      this.gameState = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_ENDED, (data: GameState) => {
      console.log('Game ended:', data);
      this.gameState = data;
    });

    this.socket.on(SOCKET_EVENTS.GAME_ERROR, (data: { message: string }) => {
      console.error('Game error:', data.message);
      // You might want to show this error to the user in a more user-friendly way
    });
  }

  makeMove(index: number) {
    if (
      !this.gameState ||
      this.gameState.board[index] ||
      !this.isMyTurn() ||
      this.gameState.isGameOver
    ) {
      return;
    }

    console.log('Making move at index:', index);
    
    // Update local state immediately for better UX
    this.gameState.board[index] = this.gameState.players[this.currentPlayerId];

    // Send move to server
    this.socket.emit(SOCKET_EVENTS.MAKE_MOVE, {
      gameId: this.activeGameId,
      playerId: this.currentPlayerId,
      position: index
    });
  }

  isMyTurn(): boolean {
    if (!this.gameState || !this.gameState.players[this.currentPlayerId]) {
      return false;
    }
    return this.gameState.players[this.currentPlayerId] === this.gameState.currentPlayer;
  }

  invitePlayer(otherPlayerId: string) {
    console.log('Inviting player:', otherPlayerId);
    this.socket.emit(SOCKET_EVENTS.SEND_GAME_INVITE, {
      from: this.currentPlayerId,
      to: otherPlayerId
    });
  }

  acceptInvite() {
    if (this.pendingInvite) {
      console.log('Accepting invite:', this.pendingInvite);
      
      // Disable the accept button to prevent multiple clicks
      const acceptButton = document.querySelector('.accept') as HTMLButtonElement;
      if (acceptButton) {
        acceptButton.disabled = true;
      }

      this.socket.emit(SOCKET_EVENTS.ACCEPT_GAME_INVITE, {
        gameId: this.pendingInvite.gameId,
        playerId: this.currentPlayerId
      });

      // Clear pending invite to prevent multiple accepts
      this.pendingInvite = null;
    }
  }

  declineInvite() {
    this.pendingInvite = null;
  }

  getAvailablePlayers() {
    return Object.entries(this.gameState.players)
      .filter(([id]) => id !== this.currentPlayerId)
      .map(([id, symbol]) => ({ id, symbol }));
  }
}
