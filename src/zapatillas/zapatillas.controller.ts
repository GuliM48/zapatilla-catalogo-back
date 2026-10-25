import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FilterZapatillasDto } from './dto/filter-zapatillas.dto';
import { ZapatillaResponseDto } from './dto/zapatilla-response.dto';
import { ZapatillasService } from './zapatillas.service';

@ApiTags('Zapatillas')
@Controller('zapatillas')
export class ZapatillasController {
  constructor(private readonly zapatillasService: ZapatillasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar catálogo de zapatillas',
    description: 'Obtiene el listado de zapatillas con soporte de filtros por texto (q), marca, talla, precio mínimo/máximo, orden y stock.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de zapatillas obtenido exitosamente',
    type: [ZapatillaResponseDto],
  })
  findAll(@Query() filterDto: FilterZapatillasDto): ZapatillaResponseDto[] {
    return this.zapatillasService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de zapatilla por ID' })
  @ApiParam({ name: 'id', description: 'ID de la zapatilla', example: 'zap-001' })
  @ApiResponse({
    status: 200,
    description: 'Detalle de la zapatilla',
    type: ZapatillaResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Zapatilla no encontrada' })
  findOne(@Param('id') id: string): ZapatillaResponseDto {
    return this.zapatillasService.findOne(id);
  }
}
