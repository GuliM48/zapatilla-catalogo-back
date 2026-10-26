import { Module } from '@nestjs/common';
import { ZapatillasController } from './zapatillas.controller.js';
import { ZapatillasService } from './zapatillas.service.js';

@Module({
  controllers: [ZapatillasController],
  providers: [ZapatillasService],
  exports: [ZapatillasService],
})
export class ZapatillasModule {}
