import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlayerListComponent {
  @Input() players: string[] = [];
  @Input() pendingInvite: any;
  @Output() invitePlayer = new EventEmitter<string>();

  trackByPlayerId(index: number, playerId: string): string {
    return playerId;
  }

  onInviteClick(playerId: string): void {
    this.invitePlayer.emit(playerId);
  }

  isPendingInvite(playerId: string): boolean {
    return this.pendingInvite?.to === playerId;
  }
}
