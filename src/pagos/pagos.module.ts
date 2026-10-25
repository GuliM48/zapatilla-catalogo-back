import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PedidosModule } from '../pedidos/pedidos.module';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [PedidosModule, ConfigModule],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
