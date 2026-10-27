import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service.js';
import { ZapatillasService } from '../zapatillas/zapatillas.service.js';
import { CreatePedidoDto } from './dto/create-pedido.dto.js';
import {
  EstadoPedidoEnum,
  ItemPedidoResponseDto,
  PedidoResponseDto,
} from './dto/pedido-response.dto.js';

const COSTO_ENVIO = 15.0;

@Injectable()
export class PedidosService {
  private readonly logger = new Logger(PedidosService.name);
  private readonly collectionName = 'pedidos';

  // Almacenamiento en memoria como fallback para desarrollo local o tests sin Firestore
  private readonly pedidosMap = new Map<string, PedidoResponseDto>();

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly zapatillasService: ZapatillasService,
  ) {
    // Pedido inicial de demostración para pruebas
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
      montoEnvio: COSTO_ENVIO,
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
      fechaCreacion: '2026-10-24T10:00:00.000Z',
    });
  }

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  /**
   * Crea un pedido calculando el precio real desde la base de datos de zapatillas
   * y persistiendo en Firestore (con fallback en memoria).
   */
  async create(dto: CreatePedidoDto, usuarioId = 'invitado'): Promise<PedidoResponseDto> {
    const items: ItemPedidoResponseDto[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      let nombre = 'Zapatilla Catálogo Pizzo';
      let precioUnitario = item.precioUnitario;

      try {
        const zapatilla = await this.zapatillasService.findOne(item.zapatillaId);
        nombre = zapatilla.nombre;
        // El precio real se toma de la base de datos para prevenir manipulación por parte del cliente
        precioUnitario = zapatilla.precio;
      } catch (_) {
        this.logger.warn(`No se pudo verificar precio en BD para zapatilla ${item.zapatillaId}. Usando precio enviado.`);
      }

      const itemSubtotal = Number((precioUnitario * item.cantidad).toFixed(2));
      subtotal += itemSubtotal;

      items.push({
        zapatillaId: item.zapatillaId,
        nombre,
        cantidad: item.cantidad,
        talla: item.talla,
        precioUnitario,
        subtotal: itemSubtotal,
      });
    }

    const montoSubtotal = Number(subtotal.toFixed(2));
    const montoTotal = Number((montoSubtotal + COSTO_ENVIO).toFixed(2));
    const nowIso = new Date().toISOString();

    const datos: Omit<PedidoResponseDto, 'id'> = {
      usuarioId,
      items,
      montoEnvio: COSTO_ENVIO,
      montoSubtotal,
      montoTotal,
      estado: EstadoPedidoEnum.PENDIENTE_PAGO,
      metodoPago: dto.metodoPago,
      direccionEnvio: { ...dto.direccionEnvio },
      notas: dto.notas,
      fechaCreacion: nowIso,
    };

    // Intentar persistir en Firestore
    try {
      const ref = await this.collection.add(datos);
      const pedido: PedidoResponseDto = { id: ref.id, ...datos };
      this.pedidosMap.set(ref.id, pedido);
      return pedido;
    } catch (error) {
      this.logger.warn('No se pudo guardar pedido en Firestore, utilizando memoria:', error);
      const id = `ped-${Date.now()}`;
      const pedido: PedidoResponseDto = { id, ...datos };
      this.pedidosMap.set(id, pedido);
      return pedido;
    }
  }

  /**
   * Obtiene los pedidos del usuario desde Firestore o memoria.
   */
  async findMisPedidos(usuarioId = 'invitado'): Promise<PedidoResponseDto[]> {
    try {
      const snapshot = await this.collection.where('usuarioId', '==', usuarioId).get();
      if (!snapshot.empty) {
        const lista = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<PedidoResponseDto, 'id'>),
        }));
        return lista.sort((a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? ''));
      }
    } catch (error) {
      this.logger.warn('Error leyendo pedidos desde Firestore, usando memoria:', error);
    }

    const list = Array.from(this.pedidosMap.values()).filter(
      (p) => p.usuarioId === usuarioId,
    );
    return list.sort((a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? ''));
  }

  /**
   * Busca un pedido por ID en Firestore o en memoria.
   */
  async findOne(id: string): Promise<PedidoResponseDto> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...(doc.data() as Omit<PedidoResponseDto, 'id'>) };
      }
    } catch (error) {
      this.logger.warn(`Error buscando pedido '${id}' en Firestore:`, error);
    }

    const local = this.pedidosMap.get(id);
    if (local) {
      return local;
    }

    throw new NotFoundException(`Pedido con id '${id}' no encontrado`);
  }

  /**
   * Actualiza el estado y url de pago del pedido en Firestore y memoria.
   */
  async actualizarEstado(
    id: string,
    nuevoEstado: EstadoPedidoEnum,
    urlPago?: string,
  ): Promise<PedidoResponseDto> {
    const nowIso = new Date().toISOString();
    const updatePayload: Record<string, any> = {
      estado: nuevoEstado,
      fechaActualizacion: nowIso,
    };
    if (urlPago) {
      updatePayload.urlPago = urlPago;
    }

    try {
      const ref = this.collection.doc(id);
      const doc = await ref.get();
      if (doc.exists) {
        await ref.update(updatePayload);
        const updated = await ref.get();
        const pedido: PedidoResponseDto = {
          id: updated.id,
          ...(updated.data() as Omit<PedidoResponseDto, 'id'>),
        };
        this.pedidosMap.set(id, pedido);
        return pedido;
      }
    } catch (error) {
      this.logger.warn(`Error actualizando estado en Firestore para pedido ${id}:`, error);
    }

    const local = this.pedidosMap.get(id);
    if (local) {
      local.estado = nuevoEstado;
      local.fechaActualizacion = nowIso;
      if (urlPago) {
        local.urlPago = urlPago;
      }
      return local;
    }

    throw new NotFoundException(`Pedido con id '${id}' no encontrado`);
  }
}
