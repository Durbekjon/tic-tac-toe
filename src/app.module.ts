import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { GameGateway } from './game/game.gateway';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    GameModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client', 'dist'),
      exclude: ['/api*'],
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService, GameGateway],
})
export class AppModule {}
