import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PagosModule } from './pagos/pagos.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { ZapatillasModule } from './zapatillas/zapatillas.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ZapatillasModule,
    PedidosModule,
    PagosModule,
  ],
})
export class AppModule {}
