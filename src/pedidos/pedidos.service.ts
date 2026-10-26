import { Injectable, NotFoundException } from '@nestjs/common';
import { ZapatillasService } from '../zapatillas/zapatillas.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import { EstadoPedidoEnum, ItemPedidoResponseDto, PedidoResponseDto } from './dto/pedido-response.dto.js';

@Injectable()
export class PedidosService {
  // Almacenamiento en memoria para pedidos en desarrollo
  private readonly pedidosMap = new Map<string, PedidoResponseDto>();

  constructor(private readonly zapatillasService: ZapatillasService) {
    // Inicializar con un pedido de demostración
    const idDemo = 'ped-1729000000000';
    this.pedidosMap.set(idDemo, {
      id: idDemo,
      usuarioId: 'user-mock-123',
      items: [
        {
          zapatillaId: 'zap-001',
          nombre: 'Pizzo Velocity 3D Pro',
          cantidad: 1,
          talla: 42,
          precioUnitario: 289.90,
          subtotal: 289.90,
        },
      ],
      montoEnvio: 15.00,
      montoSubtotal: 289.90,
      montoTotal: 304.90,
      estado: EstadoPedidoEnum.PAGADO,
      metodoPago: CreatePedidoDto.prototype.metodoPago || ('mercado_pago' as any),
      direccionEnvio: {
        calle: 'Av. España 123',
        ciudad: 'Trujillo',
        region: 'La Libertad',
        codigoPostal: '13001',
        telefono: '987654321',
      },
      fechaCreacion: new Date('2026-10-24T10:00:00.000Z'),
    });
  }

  async create(createPedidoDto: CreatePedidoDto, usuarioId = 'user-mock-123'): Promise<PedidoResponseDto> {
    const itemsProcesados: ItemPedidoResponseDto[] = [];
    let subtotalCalculado = 0;

    for (const itemDto of createPedidoDto.items) {
      let nombre = 'Zapatilla Catálogo Pizzo';
      try {
        const zap = await this.zapatillasService.findOne(itemDto.zapatillaId);
        nombre = zap.nombre;
      } catch (_) {}

      const itemSubtotal = Number((itemDto.precioUnitario * itemDto.cantidad).toFixed(2));
      subtotalCalculado += itemSubtotal;

      itemsProcesados.push({
        zapatillaId: itemDto.zapatillaId,
        nombre,
        cantidad: itemDto.cantidad,
        talla: itemDto.talla,
        precioUnitario: itemDto.precioUnitario,
        subtotal: itemSubtotal,
      });
    }

    const costoEnvio = 15.00;
    const montoTotal = Number((subtotalCalculado + costoEnvio).toFixed(2));
    const pedidoId = `ped-${Date.now()}`;

    const nuevoPedido: PedidoResponseDto = {
      id: pedidoId,
      usuarioId,
      items: itemsProcesados,
      montoEnvio: costoEnvio,
      montoSubtotal: Number(subtotalCalculado.toFixed(2)),
      montoTotal,
      estado: EstadoPedidoEnum.PENDIENTE_PAGO,
      metodoPago: createPedidoDto.metodoPago,
      direccionEnvio: createPedidoDto.direccionEnvio,
      fechaCreacion: new Date(),
    };

    this.pedidosMap.set(pedidoId, nuevoPedido);
    return nuevoPedido;
  }

  findMisPedidos(usuarioId = 'user-mock-123'): PedidoResponseDto[] {
    const list = Array.from(this.pedidosMap.values()).filter(
      (p) => p.usuarioId === usuarioId,
    );
    return list.sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime());
  }

  findOne(id: string): PedidoResponseDto {
    const pedido = this.pedidosMap.get(id);
    if (!pedido) {
      throw new NotFoundException(`Pedido con id '${id}' no encontrado`);
    }
    return pedido;
  }

  actualizarEstado(id: string, nuevoEstado: EstadoPedidoEnum, urlPago?: string): PedidoResponseDto {
    const pedido = this.findOne(id);
    pedido.estado = nuevoEstado;
    pedido.fechaActualizacion = new Date();
    if (urlPago) {
      pedido.urlPago = urlPago;
    }
    this.pedidosMap.set(id, pedido);
    return pedido;
  }
}
