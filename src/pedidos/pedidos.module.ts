import { Module } from '@nestjs/common';
import { ZapatillasModule } from '../zapatillas/zapatillas.module';
import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';

@Module({
  imports: [ZapatillasModule],
  controllers: [PedidosController],
  providers: [PedidosService],
  exports: [PedidosService],
})
export class PedidosModule {}
