export interface GameState {
  board: string[];
  currentPlayer: string;
  winner: string | null;
  isGameOver: boolean;
  players: { [key: string]: string };
  status: 'waiting' | 'in-progress' | 'finished';
  gameId?: string;
  winningCombination?: number[];
}
