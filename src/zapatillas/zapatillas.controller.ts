import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { ZapatillasService } from './zapatillas.service.js';
import { CreateZapatillaDto } from './dto/create-zapatilla.dto.js';
import { UpdateZapatillaDto } from './dto/update-zapatilla.dto.js';
import { FilterZapatillasDto } from './dto/filter-zapatillas.dto.js';
import { ZapatillaResponseDto } from './dto/zapatilla-response.dto.js';
import { UploadedFileDto } from './file-upload.interface.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { UserRole } from '../auth/user.interface.js';

@ApiTags('Zapatillas')
@Controller('zapatillas')
export class ZapatillasController {
  constructor(private readonly zapatillasService: ZapatillasService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar catálogo de zapatillas',
    description:
      'Obtiene el listado de zapatillas con soporte de filtros por texto (q), marca, talla, precio mínimo/máximo, orden y stock. Admite all=true para panel administrativo.',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de zapatillas obtenido exitosamente',
    type: [ZapatillaResponseDto],
  })
  findAll(
    @Query() filterDto: FilterZapatillasDto,
    @Query('all') all?: string,
  ): Promise<ZapatillaResponseDto[]> {
    const includeInactive = all === 'true';
    return this.zapatillasService.findAll(filterDto, includeInactive);
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
  findOne(@Param('id') id: string): Promise<ZapatillaResponseDto> {
    return this.zapatillasService.findOne(id);
  }

  // SOLO ADMIN: Subir imagen o modelo 3D a Firebase Storage
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo (imagen o modelo .glb) a Firebase Storage (Solo ADMIN)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  uploadFile(@UploadedFile() file: UploadedFileDto) {
    return this.zapatillasService.uploadFile(file);
  }

  // SOLO ADMIN: Agregar zapatilla
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Crear nueva zapatilla en el catálogo (Solo ADMIN)' })
  @ApiResponse({ status: 201, description: 'Zapatilla creada con éxito' })
  create(@Body() createZapatillaDto: CreateZapatillaDto) {
    return this.zapatillasService.create(createZapatillaDto);
  }

  // SOLO ADMIN: Editar zapatilla (precio, stock, volver a activar con activo: true, etc.)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar zapatilla existente (Solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la zapatilla' })
  update(
    @Param('id') id: string,
    @Body() updateZapatillaDto: UpdateZapatillaDto,
  ) {
    return this.zapatillasService.update(id, updateZapatillaDto);
  }

  // SOLO ADMIN: Desactivar zapatilla (Soft delete)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Desactivar zapatilla del catálogo (Solo ADMIN)' })
  @ApiParam({ name: 'id', description: 'ID de la zapatilla' })
  deactivate(@Param('id') id: string) {
    return this.zapatillasService.deactivate(id);
  }
}
