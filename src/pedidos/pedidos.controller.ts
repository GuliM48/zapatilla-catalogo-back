import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { PedidoResponseDto } from './dto/pedido-response.dto.js';
import { PedidosService } from './pedidos.service.js';

type RequestConUsuario = { user?: { id?: string; email?: string } | null };

// Si el usuario envió token JWT válido se toma su ID; de lo contrario queda como "invitado"
const usuarioDe = (req: RequestConUsuario): string => req.user?.id ?? 'invitado';

@ApiTags('Pedidos')
@ApiBearerAuth()
@UseGuards(OptionalJwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pedido',
    description:
      'Recibe los items del carrito, dirección de envío y método de pago para registrar el pedido con estado inicial pendiente_pago. El precio unitario se verifica con la base de datos.',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente',
    type: PedidoResponseDto,
  })
  async create(
    @Body() createPedidoDto: CreatePedidoDto,
    @Req() req: RequestConUsuario,
  ): Promise<PedidoResponseDto> {
    return this.pedidosService.create(createPedidoDto, usuarioDe(req));
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos los pedidos (Panel Admin y Reportes)',
    description: 'Retorna todos los pedidos registrados en Firestore para cálculo de métricas de ventas y KPIs.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista completa de pedidos',
    type: [PedidoResponseDto],
  })
  async findAll(): Promise<PedidoResponseDto[]> {
    return this.pedidosService.findAll();
  }

  @Get('mis')
  @ApiOperation({
    summary: 'Obtener mis pedidos',
    description: 'Retorna la lista de pedidos realizados por el usuario actual (o invitado si no hay token).',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos del usuario',
    type: [PedidoResponseDto],
  })
  async findMisPedidos(@Req() req: RequestConUsuario): Promise<PedidoResponseDto[]> {
    return this.pedidosService.findMisPedidos(usuarioDe(req));
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
  async findOne(@Param('id') id: string): Promise<PedidoResponseDto> {
    return this.pedidosService.findOne(id);
  }
}
