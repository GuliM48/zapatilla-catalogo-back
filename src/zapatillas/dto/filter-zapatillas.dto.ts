import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum OrdenCriterio {
  PRECIO_ASC = 'precio_asc',
  PRECIO_DESC = 'precio_desc',
  NUEVO = 'nuevo',
  NOMBRE = 'nombre',
}

export class FilterZapatillasDto {
  @ApiPropertyOptional({ description: 'Búsqueda por texto (nombre, marca o descripción)', example: 'Runner' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filtro por marca', example: 'Pizzo' })
  @IsOptional()
  @IsString()
  marca?: string;

  @ApiPropertyOptional({ description: 'Filtro por talla disponible', example: 42 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  talla?: number;

  @ApiPropertyOptional({ description: 'Precio mínimo de filtrado', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo de filtrado', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @ApiPropertyOptional({
    description: 'Criterio de ordenación',
    enum: OrdenCriterio,
    example: OrdenCriterio.PRECIO_ASC,
  })
  @IsOptional()
  @IsEnum(OrdenCriterio)
  orden?: OrdenCriterio;

  @ApiPropertyOptional({ description: 'Retornar solo zapatillas con stock disponible', example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  soloConStock?: boolean;
}
