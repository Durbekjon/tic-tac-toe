import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { GameState } from '../../interfaces/game.interface';

@Component({
  selector: 'app-game-board',
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GameBoardComponent {
  @Input() gameState!: GameState;
  @Input() currentPlayerId!: string;
  @Input() isMyTurn!: boolean;
  @Output() move = new EventEmitter<number>();

  rows = [0, 1, 2];
  cols = [0, 1, 2];

  makeMove(index: number): void {
    if (this.isValidMove(index)) {
      this.move.emit(index);
    }
  }

  isValidMove(index: number): boolean {
    return this.isMyTurn && 
           !this.gameState.isGameOver && 
           !this.gameState.board[index];
  }

  getCellClass(index: number): string {
    const classes = ['cell'];
    
    if (!this.isValidMove(index)) {
      classes.push('disabled');
    }
    
    if (this.gameState.winningCombination?.includes(index)) {
      classes.push('winning-cell');
    }
    
    return classes.join(' ');
  }
}
