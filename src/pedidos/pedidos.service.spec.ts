import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PedidosService } from './pedidos.service.js';
import { EstadoPedidoEnum } from './dto/pedido-response.dto.js';
import { MetodoPagoEnum } from './dto/create-pedido.dto.js';

describe('PedidosService', () => {
  let pedidosService: PedidosService;
  let mockFirebaseService: any;
  let mockZapatillasService: any;

  beforeEach(() => {
    mockFirebaseService = {
      getFirestore: vi.fn().mockReturnValue({
        collection: vi.fn().mockReturnValue({
          add: vi.fn().mockRejectedValue(new Error('Firestore offline in unit test')),
          where: vi.fn().mockReturnValue({
            get: vi.fn().mockRejectedValue(new Error('Firestore offline in unit test')),
          }),
          doc: vi.fn().mockReturnValue({
            get: vi.fn().mockRejectedValue(new Error('Firestore offline in unit test')),
            update: vi.fn().mockRejectedValue(new Error('Firestore offline in unit test')),
          }),
        }),
      }),
    };

    mockZapatillasService = {
      findOne: vi.fn().mockResolvedValue({
        id: 'zap-001',
        nombre: 'Pizzo Velocity 3D Pro',
        precio: 250.0,
      }),
      disminuirStock: vi.fn().mockResolvedValue(undefined),
    };

    pedidosService = new PedidosService(mockFirebaseService, mockZapatillasService);
  });

  it('debe crear un pedido calculando el precio desde la BD de zapatillas', async () => {
    const pedido = await pedidosService.create(
      {
        items: [
          {
            zapatillaId: 'zap-001',
            cantidad: 2,
            talla: 42,
            precioUnitario: 10.0, // Cliente manda precio menor (posible alteración)
          },
        ],
        direccionEnvio: {
          calle: 'Av. Larco 456',
          ciudad: 'Trujillo',
          region: 'La Libertad',
          telefono: '987654321',
        },
        metodoPago: MetodoPagoEnum.MERCADO_PAGO,
      },
      'user-test-456',
    );

    expect(pedido).toBeDefined();
    expect(pedido.usuarioId).toBe('user-test-456');
    expect(pedido.items[0].precioUnitario).toBe(250.0); // Usa precio de la BD
    expect(pedido.montoSubtotal).toBe(500.0);
    expect(pedido.montoEnvio).toBe(15.0);
    expect(pedido.montoTotal).toBe(515.0);
    expect(pedido.estado).toBe(EstadoPedidoEnum.PENDIENTE_PAGO);
  });

  it('debe actualizar el estado de un pedido y asignar url de pago', async () => {
    const nuevo = await pedidosService.create(
      {
        items: [
          {
            zapatillaId: 'zap-001',
            cantidad: 1,
            talla: 40,
            precioUnitario: 250.0,
          },
        ],
        direccionEnvio: {
          calle: 'Av. América 789',
          ciudad: 'Trujillo',
          region: 'La Libertad',
          telefono: '987111222',
        },
        metodoPago: MetodoPagoEnum.MERCADO_PAGO,
      },
      'user-test-789',
    );

    const actualizado = await pedidosService.actualizarEstado(
      nuevo.id,
      EstadoPedidoEnum.PAGADO,
      'https://sandbox.mercadopago.com/redirect?id=123',
    );

    expect(actualizado.estado).toBe(EstadoPedidoEnum.PAGADO);
    expect(actualizado.urlPago).toBe('https://sandbox.mercadopago.com/redirect?id=123');
  });

  it('debe listar los pedidos del usuario', async () => {
    const lista = await pedidosService.findMisPedidos('user-test-789');
    expect(Array.isArray(lista)).toBe(true);
  });
});
