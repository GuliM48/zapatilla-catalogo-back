import { IsString, IsNumber, IsNotEmpty, IsOptional, Min, IsBoolean } from 'class-validator';

export class CreateZapatillaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  marca: string;

  @IsNumber()
  @Min(0)
  precio: number;

  @IsString()
  @IsNotEmpty()
  talla: string;

  @IsNumber()
  @Min(0)
  stock: number;

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
  activo?: boolean = true;
}
