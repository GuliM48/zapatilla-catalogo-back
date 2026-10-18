import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseModule } from './firebase/firebase.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ZapatillasModule } from './zapatillas/zapatillas.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    AuthModule,
    ZapatillasModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
