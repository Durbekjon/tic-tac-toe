import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { GameModule } from './game/game.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'client', 'dist', 'battle-game-client'),
      exclude: ['/api*', '/socket.io*'],
    }),
    GameModule,
  ],
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
