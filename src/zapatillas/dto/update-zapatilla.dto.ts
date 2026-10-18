import { IsString, IsNumber, IsOptional, Min, IsBoolean } from 'class-validator';

export class UpdateZapatillaDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  marca?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  precio?: number;

  @IsString()
  @IsOptional()
  talla?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsString()
  @IsOptional()
  imagenUrl?: string;

  @IsString()
  @IsOptional()
  modelo3dUrl?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
