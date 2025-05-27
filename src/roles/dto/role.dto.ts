import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsBoolean,
    MaxLength,
    MinLength,
    ArrayNotEmpty,
  } from 'class-validator';
  import { PartialType } from '@nestjs/mapped-types';
  
  export class CreateRoleDto {
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    name: string;
  
    @IsOptional()
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @MaxLength(255, { message: 'La descripción no puede exceder 255 caracteres' })
    description?: string;
  
    @IsOptional()
    @IsArray({ message: 'Los permisos deben ser un array' })
    @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
    permissions?: string[];
  
    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser un valor booleano' })
    isActive?: boolean;
  }
  
  export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
  
  export class AssignPermissionsDto {
    @IsArray({ message: 'Los permisos deben ser un array' })
    @ArrayNotEmpty({ message: 'Debe proporcionar al menos un permiso' })
    @IsString({ each: true, message: 'Cada permiso debe ser una cadena de texto' })
    permissions: string[];
  }