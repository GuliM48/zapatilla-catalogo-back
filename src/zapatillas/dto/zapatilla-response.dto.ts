import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ZapatillaResponseDto {
  @ApiProperty({ example: 'zap-001' })
  id: string;

  @ApiProperty({ example: 'Pizzo Velocity 3D Pro' })
  nombre: string;

  @ApiProperty({ example: 'Pizzo' })
  marca: string;

  @ApiProperty({ example: 'Velocity 2026' })
  modelo: string;

  @ApiProperty({ example: 289.90 })
  precio: number;

  @ApiPropertyOptional({ example: 349.90 })
  precioAnterior?: number;

  @ApiProperty({ example: 'Zapatilla con soporte de amortiguación responsiva y visualización 3D GLB.' })
  descripcion: string;

  @ApiProperty({ example: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'] })
  imagenes: string[];

  @ApiProperty({
    example: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb',
  })
  modelo3dUrl: string;

  @ApiProperty({ example: [38, 39, 40, 41, 42, 43] })
  tallasDisponibles: number[];

  @ApiProperty({ example: ['Negro/Rojo', 'Blanco/Verde'] })
  colores: string[];

  @ApiProperty({ example: 15 })
  stock: number;

  @ApiProperty({ example: true })
  esNuevo: boolean;

  @ApiProperty({ example: 'Deportivas' })
  categoria: string;
}
