import { Injectable, NotFoundException } from '@nestjs/common';
import { FilterZapatillasDto, OrdenCriterio } from './dto/filter-zapatillas.dto';
import { ZapatillaResponseDto } from './dto/zapatilla-response.dto';

@Injectable()
export class ZapatillasService {
  private readonly zapatillasCatalog: ZapatillaResponseDto[] = [
    {
      id: 'zap-001',
      nombre: 'Pizzo Velocity 3D Pro',
      marca: 'Pizzo',
      modelo: 'Velocity 2026',
      precio: 289.90,
      precioAnterior: 349.90,
      descripcion: 'Zapatilla de alto rendimiento para atletismo urbano con malla transpirable y suela con agarre dinámico. Incluye visor 3D interactivo con texturas PBR.',
      imagenes: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5',
      ],
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      tallasDisponibles: [38, 39, 40, 41, 42, 43],
      colores: ['Negro/Rojo', 'Blanco/Azul'],
      stock: 15,
      esNuevo: true,
      categoria: 'Deportivas',
    },
    {
      id: 'zap-002',
      nombre: 'Nike Air Max Excee 3D',
      marca: 'Nike',
      modelo: 'Air Max Excee',
      precio: 399.00,
      precioAnterior: 449.00,
      descripcion: 'Diseño icónico con amortiguación Air visible en el talón. Estilo retro actualizado con materiales livianos y durables.',
      imagenes: [
        'https://images.unsplash.com/photo-1552346154-21d32810aba3',
      ],
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      tallasDisponibles: [39, 40, 41, 42],
      colores: ['Blanco/Rojo', 'Gris/Negro'],
      stock: 8,
      esNuevo: false,
      categoria: 'Urbanas',
    },
    {
      id: 'zap-003',
      nombre: 'Adidas Ultraboost Light',
      marca: 'Adidas',
      modelo: 'Ultraboost Light 23',
      precio: 459.90,
      descripcion: 'Siente una energía épica con las nuevas Ultraboost Light, nuestras Ultraboost más ligeras creadas hasta la fecha.',
      imagenes: [
        'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2',
      ],
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      tallasDisponibles: [38, 40, 41, 42, 43, 44],
      colores: ['Negro', 'Azul Marino'],
      stock: 22,
      esNuevo: true,
      categoria: 'Running',
    },
    {
      id: 'zap-004',
      nombre: 'Pizzo Speed Runner Minimal',
      marca: 'Pizzo',
      modelo: 'Speed Runner X',
      precio: 199.90,
      precioAnterior: 229.90,
      descripcion: 'Diseño ultra liviano ideal para caminatas largas y entrenamientos diarios de bajo impacto. Ajuste tipo calcetín.',
      imagenes: [
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      ],
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      tallasDisponibles: [37, 38, 39, 40, 41],
      colores: ['Gris/Menta', 'Rosa/Blanco'],
      stock: 5,
      esNuevo: true,
      categoria: 'Running',
    },
    {
      id: 'zap-005',
      nombre: 'Puma RS-X3 Puzzle 3D',
      marca: 'Puma',
      modelo: 'RS-X3',
      precio: 329.00,
      descripcion: 'La familia RS se amplia con esta versión X3. La silueta voluminosa se combina con mezclas de materiales y combinaciones de colores vibrantes.',
      imagenes: [
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
      ],
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      tallasDisponibles: [40, 41, 42, 43],
      colores: ['Multicolor'],
      stock: 0,
      esNuevo: false,
      categoria: 'Urbanas',
    },
  ];

  findAll(filters: FilterZapatillasDto): ZapatillaResponseDto[] {
    let result = [...this.zapatillasCatalog];

    // 1. Filtro por búsqueda de texto
    if (filters.q && filters.q.trim() !== '') {
      const term = filters.q.toLowerCase().trim();
      result = result.filter(
        (z) =>
          z.nombre.toLowerCase().includes(term) ||
          z.marca.toLowerCase().includes(term) ||
          z.descripcion.toLowerCase().includes(term),
      );
    }

    // 2. Filtro por marca
    if (filters.marca && filters.marca.trim() !== '') {
      const marcaTerm = filters.marca.toLowerCase().trim();
      result = result.filter((z) => z.marca.toLowerCase() === marcaTerm);
    }

    // 3. Filtro por talla
    if (filters.talla !== undefined) {
      const tallaNum = Number(filters.talla);
      result = result.filter((z) => z.tallasDisponibles.includes(tallaNum));
    }

    // 4. Filtro por precio mínimo
    if (filters.precioMin !== undefined) {
      result = result.filter((z) => z.precio >= filters.precioMin);
    }

    // 5. Filtro por precio máximo
    if (filters.precioMax !== undefined) {
      result = result.filter((z) => z.precio <= filters.precioMax);
    }

    // 6. Filtro por stock
    if (filters.soloConStock) {
      result = result.filter((z) => z.stock > 0);
    }

    // 7. Ordenamiento
    if (filters.orden) {
      switch (filters.orden) {
        case OrdenCriterio.PRECIO_ASC:
          result.sort((a, b) => a.precio - b.precio);
          break;
        case OrdenCriterio.PRECIO_DESC:
          result.sort((a, b) => b.precio - a.precio);
          break;
        case OrdenCriterio.NUEVO:
          result.sort((a, b) => (b.esNuevo === a.esNuevo ? 0 : b.esNuevo ? 1 : -1));
          break;
        case OrdenCriterio.NOMBRE:
          result.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
      }
    }

    return result;
  }

  findOne(id: string): ZapatillaResponseDto {
    const zapatilla = this.zapatillasCatalog.find((z) => z.id === id);
    if (!zapatilla) {
      throw new NotFoundException(`Zapatilla con id '${id}' no encontrada`);
    }
    return zapatilla;
  }
}
