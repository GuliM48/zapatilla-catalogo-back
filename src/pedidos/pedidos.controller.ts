import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { PedidoResponseDto } from './dto/pedido-response.dto';
import { PedidosService } from './pedidos.service';

@ApiTags('Pedidos')
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pedido',
    description: 'Recibe los items del carrito, dirección de envío y método de pago para registrar el pedido con estado inicial pendiente_pago.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente',
    type: PedidoResponseDto,
  })
  create(@Body() createPedidoDto: CreatePedidoDto): PedidoResponseDto {
    return this.pedidosService.create(createPedidoDto);
  }

  @Get('mis')
  @ApiOperation({
    summary: 'Obtener mis pedidos',
    description: 'Retorna la lista de pedidos realizados por el usuario actual.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos del usuario',
    type: [PedidoResponseDto],
  })
  findMisPedidos(): PedidoResponseDto[] {
    return this.pedidosService.findMisPedidos();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de pedido por ID' })
  @ApiParam({ name: 'id', description: 'ID del pedido', example: 'ped-1729000000000' })
  @ApiResponse({
    status: 200,
    description: 'Detalle del pedido',
    type: PedidoResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Pedido no encontrado' })
  findOne(@Param('id') id: string): PedidoResponseDto {
    return this.pedidosService.findOne(id);
  }
}
