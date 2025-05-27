import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsOptional,
    IsEnum,
    IsUUID,
    MaxLength,
    IsArray,
    Matches,
  } from 'class-validator';
  import { PartialType } from '@nestjs/mapped-types';
  import { UserStatus } from '../entities/user.entity';
  
  export class CreateUserDto {
    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;
  
    @IsString({ message: 'El nombre debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    firstName: string;
  
    @IsString({ message: 'El apellido debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El apellido es requerido' })
    @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
    lastName: string;
  
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
      message: 'El número de teléfono debe tener un formato válido',
    })
    phoneNumber?: string;
  
    @IsOptional()
    @IsEnum(UserStatus, { message: 'El estado debe ser ACTIVE, INACTIVE o SUSPENDED' })
    status?: UserStatus;
  
    @IsOptional()
    @IsArray({ message: 'Los roles deben ser un array' })
    @IsUUID('all', { each: true, message: 'Cada rol debe ser un UUID válido' })
    roleIds?: string[];
  }
  
  export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsString({ message: 'El avatar debe ser una cadena de texto' })
    avatar?: string;
  }
  
  export class AssignRolesDto {
    @IsArray({ message: 'Los roles deben ser un array' })
    @IsUUID('all', { each: true, message: 'Cada rol debe ser un UUID válido' })
    @IsNotEmpty({ message: 'Debe proporcionar al menos un rol' })
    roleIds: string[];
  }
  
  export class UpdateUserStatusDto {
    @IsEnum(UserStatus, { message: 'El estado debe ser ACTIVE, INACTIVE o SUSPENDED' })
    @IsNotEmpty({ message: 'El estado es requerido' })
    status: UserStatus;
  }