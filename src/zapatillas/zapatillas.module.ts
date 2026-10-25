import { Module } from '@nestjs/common';
import { ZapatillasController } from './zapatillas.controller';
import { ZapatillasService } from './zapatillas.service';

@Module({
  controllers: [ZapatillasController],
  providers: [ZapatillasService],
  exports: [ZapatillasService],
})
export class ZapatillasModule {}
