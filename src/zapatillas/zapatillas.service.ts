import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import sharp from 'sharp';
import { FirebaseService } from '../firebase/firebase.service.js';
import { CreateZapatillaDto } from './dto/create-zapatilla.dto.js';
import { UpdateZapatillaDto } from './dto/update-zapatilla.dto.js';
import { FilterZapatillasDto, OrdenCriterio } from './dto/filter-zapatillas.dto.js';
import { ZapatillaResponseDto } from './dto/zapatilla-response.dto.js';
import { UploadedFileDto } from './file-upload.interface.js';

export interface Zapatilla extends ZapatillaResponseDto {
  talla?: string;
  imagenUrl?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable()
export class ZapatillasService {
  private readonly logger = new Logger(ZapatillasService.name);
  private readonly collectionName = 'zapatillas';

  // Catálogo base de demostración con soporte 3D y variantes
  private readonly fallbackCatalog: Zapatilla[] = [
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
      imagenUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      talla: '38, 39, 40, 41, 42, 43',
      tallasDisponibles: [38, 39, 40, 41, 42, 43],
      colores: ['Negro/Rojo', 'Blanco/Azul'],
      stock: 15,
      esNuevo: true,
      categoria: 'Deportivas',
      activo: true,
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
      imagenUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3',
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      talla: '39, 40, 41, 42',
      tallasDisponibles: [39, 40, 41, 42],
      colores: ['Blanco/Rojo', 'Gris/Negro'],
      stock: 8,
      esNuevo: false,
      categoria: 'Urbanas',
      activo: true,
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
      imagenUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2',
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      talla: '38, 40, 41, 42, 43, 44',
      tallasDisponibles: [38, 40, 41, 42, 43, 44],
      colores: ['Negro', 'Azul Marino'],
      stock: 22,
      esNuevo: true,
      categoria: 'Running',
      activo: true,
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
      imagenUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a',
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      talla: '37, 38, 39, 40, 41',
      tallasDisponibles: [37, 38, 39, 40, 41],
      colores: ['Gris/Menta', 'Rosa/Blanco'],
      stock: 5,
      esNuevo: true,
      categoria: 'Running',
      activo: true,
    },
    {
      id: 'zap-005',
      nombre: 'Puma RS-X3 Puzzle 3D',
      marca: 'Puma',
      modelo: 'RS-X3',
      precio: 329.00,
      descripcion: 'La familia RS se amplia con esta versión X3. La silueta voluminosa se combina con mezclas de materiales y colores vibrantes.',
      imagenes: [
        'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
      ],
      imagenUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb',
      modelo3dUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
      talla: '40, 41, 42, 43',
      tallasDisponibles: [40, 41, 42, 43],
      colores: ['Multicolor'],
      stock: 0,
      esNuevo: false,
      categoria: 'Urbanas',
      activo: true,
    },
  ];

  constructor(private readonly firebaseService: FirebaseService) {}

  private get collection() {
    return this.firebaseService.getFirestore().collection(this.collectionName);
  }

  // Normaliza el documento de Firestore para soportar ambos esquemas (Mobile Flutter y Swagger/API)
  private mapDocToZapatilla(id: string, data: any): Zapatilla {
    const rawTalla = data.talla !== undefined ? String(data.talla) : '';
    let tallasDisponibles: number[] = Array.isArray(data.tallasDisponibles)
      ? data.tallasDisponibles.map(Number).filter((n: number) => !isNaN(n))
      : [];

    if (tallasDisponibles.length === 0 && rawTalla) {
      tallasDisponibles = rawTalla
        .split(/[,;\/\s]+/)
        .map((s: string) => Number(s.trim()))
        .filter((n: number) => !isNaN(n));
    }

    const imagenes: string[] = Array.isArray(data.imagenes)
      ? data.imagenes
      : data.imagenUrl
      ? [data.imagenUrl]
      : [];

    return {
      id,
      nombre: data.nombre ?? '',
      marca: data.marca ?? '',
      modelo: data.modelo ?? data.nombre ?? '',
      precio: Number(data.precio ?? 0),
      precioAnterior: data.precioAnterior !== undefined ? Number(data.precioAnterior) : undefined,
      descripcion: data.descripcion ?? '',
      imagenes,
      imagenUrl: data.imagenUrl ?? (imagenes.length > 0 ? imagenes[0] : undefined),
      modelo3dUrl: data.modelo3dUrl ?? '',
      talla: rawTalla || tallasDisponibles.join(', '),
      tallasDisponibles,
      colores: Array.isArray(data.colores) ? data.colores : [],
      stock: Number(data.stock ?? 0),
      esNuevo: Boolean(data.esNuevo ?? true),
      categoria: data.categoria ?? 'Deportivas',
      activo: data.activo !== undefined ? Boolean(data.activo) : true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  // Sube archivo a Firebase Storage optimizando automáticamente las imágenes a WebP
  async uploadFile(file: UploadedFileDto, folder = 'zapatillas'): Promise<{ url: string; fileName: string }> {
    if (!file) {
      throw new BadRequestException('No se envió ningún archivo');
    }

    const bucket = this.firebaseService.getBucket();
    const originalExt = extname(file.originalname).toLowerCase();

    let uploadBuffer = file.buffer;
    let contentType = file.mimetype;
    let fileExtension = originalExt;

    // Si es imagen, convertimos y comprimimos a WebP
    const isImage = file.mimetype.startsWith('image/') && !file.mimetype.includes('svg');
    if (isImage) {
      try {
        uploadBuffer = await sharp(file.buffer)
          .webp({ quality: 80 })
          .toBuffer();
        contentType = 'image/webp';
        fileExtension = '.webp';
      } catch (err) {
        this.logger.warn('No se pudo convertir a WebP, subiendo en formato original:', err);
      }
    }

    const fileName = `${folder}/${randomUUID()}${fileExtension}`;
    const fileUpload = bucket.file(fileName);

    await fileUpload.save(uploadBuffer, {
      metadata: {
        contentType,
      },
      public: true,
    });

    try {
      await fileUpload.makePublic();
    } catch {
      // Ignorado si la política del bucket restringe accesos públicos individuales
    }

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

    return {
      url: publicUrl,
      fileName,
    };
  }

  // Elimina un archivo físico de Firebase Storage dado su URL
  async deleteFileFromStorage(fileUrl?: string): Promise<boolean> {
    if (!fileUrl) return false;

    try {
      const bucket = this.firebaseService.getBucket();
      const prefix = `https://storage.googleapis.com/${bucket.name}/`;
      if (!fileUrl.startsWith(prefix)) {
        return false;
      }

      const filePath = decodeURIComponent(fileUrl.replace(prefix, ''));
      const file = bucket.file(filePath);

      const [exists] = await file.exists();
      if (exists) {
        await file.delete();
        return true;
      }
    } catch (error) {
      this.logger.warn(`No se pudo eliminar el archivo antiguo de Storage: ${fileUrl}`, error);
    }
    return false;
  }

  async create(createDto: CreateZapatillaDto): Promise<Zapatilla> {
    const now = new Date().toISOString();
    const docRef = await this.collection.add({
      ...createDto,
      activo: createDto.activo !== undefined ? createDto.activo : true,
      createdAt: now,
      updatedAt: now,
    });

    const doc = await docRef.get();
    return this.mapDocToZapatilla(doc.id, doc.data());
  }

  // Lista zapatillas con soporte completo para filtros y fallback a catálogo demo si no hay datos
  async findAll(filters: FilterZapatillasDto = {}, includeInactive = false): Promise<Zapatilla[]> {
    let items: Zapatilla[] = [];

    try {
      let query: any = this.collection;
      if (!includeInactive) {
        query = query.where('activo', '==', true);
      }

      const snapshot = await query.get();
      if (!snapshot.empty) {
        items = snapshot.docs.map((doc: QueryDocumentSnapshot) =>
          this.mapDocToZapatilla(doc.id, doc.data()),
        );
      }
    } catch (error) {
      this.logger.warn('No se pudo conectar a Firestore, usando catálogo base en memoria:', error);
    }

    // Si la base de datos está vacía en fase de desarrollo, usamos el catálogo demo
    if (items.length === 0) {
      items = includeInactive ? this.fallbackCatalog : this.fallbackCatalog.filter((z) => z.activo);
    }

    let result = [...items];

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
      result = result.filter(
        (z) =>
          z.tallasDisponibles.includes(tallaNum) ||
          (z.talla && z.talla.includes(String(tallaNum))),
      );
    }

    // 4. Filtro por precio mínimo
    if (filters.precioMin !== undefined) {
      result = result.filter((z) => z.precio >= filters.precioMin!);
    }

    // 5. Filtro por precio máximo
    if (filters.precioMax !== undefined) {
      result = result.filter((z) => z.precio <= filters.precioMax!);
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

  async findOne(id: string): Promise<Zapatilla> {
    try {
      const doc = await this.collection.doc(id).get();
      if (doc.exists) {
        return this.mapDocToZapatilla(doc.id, doc.data());
      }
    } catch (error) {
      this.logger.warn(`Error buscando zapatilla ${id} en Firestore:`, error);
    }

    // Fallback a catálogo demo si no está en Firestore
    const fallback = this.fallbackCatalog.find((z) => z.id === id);
    if (fallback) {
      return fallback;
    }

    throw new NotFoundException(`Zapatilla con id '${id}' no encontrada`);
  }

  async update(id: string, updateDto: UpdateZapatillaDto): Promise<Zapatilla> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Zapatilla con id ${id} no encontrada`);
    }

    const currentData = doc.data();

    if (updateDto.imagenUrl && currentData?.imagenUrl && currentData.imagenUrl !== updateDto.imagenUrl) {
      await this.deleteFileFromStorage(currentData.imagenUrl);
    }

    if (updateDto.modelo3dUrl && currentData?.modelo3dUrl && currentData.modelo3dUrl !== updateDto.modelo3dUrl) {
      await this.deleteFileFromStorage(currentData.modelo3dUrl);
    }

    const now = new Date().toISOString();
    await docRef.update({
      ...updateDto,
      updatedAt: now,
    });

    const updatedDoc = await docRef.get();
    return this.mapDocToZapatilla(updatedDoc.id, updatedDoc.data());
  }

  async deactivate(id: string): Promise<{ message: string }> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`Zapatilla con id ${id} no encontrada`);
    }

    await docRef.update({
      activo: false,
      updatedAt: new Date().toISOString(),
    });

    return { message: `Zapatilla con id ${id} desactivada exitosamente` };
  }
}
