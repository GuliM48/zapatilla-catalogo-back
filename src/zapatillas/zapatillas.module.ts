import { Module } from '@nestjs/common';
import { ZapatillasService } from './zapatillas.service.js';
import { ZapatillasController } from './zapatillas.controller.js';

@Module({
  controllers: [ZapatillasController],
  providers: [ZapatillasService],
  exports: [ZapatillasService],
})
export class ZapatillasModule {}
