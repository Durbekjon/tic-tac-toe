import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameModule } from './game/game.module';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GameModule],
  template: `
    <main>
      <h1>Battle Game</h1>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    main {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      text-align: center;
      color: #333;
      margin-bottom: 30px;
    }
  `]
})
export class AppComponent {
  title = 'Battle Game';
}
