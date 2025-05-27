import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsOptional,
  } from 'class-validator';
  
  export * from './revoke-token.dto';
  
  export class LoginDto {
    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;
  
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    password: string;
  }
  
  export class RegisterDto {
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
  
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'La contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
      },
    )
    password: string;
  
    @IsOptional()
    @IsString({ message: 'El teléfono debe ser una cadena de texto' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
      message: 'El número de teléfono debe tener un formato válido',
    })
    phoneNumber?: string;
  }
  
  export class ChangePasswordDto {
    @IsString({ message: 'La contraseña actual debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'La contraseña actual es requerida' })
    currentPassword: string;
  
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    @MaxLength(50, { message: 'La nueva contraseña no puede exceder 50 caracteres' })
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
      },
    )
    newPassword: string;
  }
  
  export class ForgotPasswordDto {
    @IsEmail({}, { message: 'Debe proporcionar un email válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;
  }
  
  export class ResetPasswordDto {
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El token es requerido' })
    token: string;
  
    @IsString({ message: 'La nueva contraseña debe ser una cadena de texto' })
    @MinLength(8, { message: 'La nueva contraseña debe tener al menos 8 caracteres' })
    @MaxLength(50, { message: 'La nueva contraseña no puede exceder 50 caracteres' })
    @Matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      {
        message: 'La nueva contraseña debe contener al menos una letra minúscula, una mayúscula, un número y un carácter especial',
      },
    )
    newPassword: string;
  }
  
  export class ValidateTokenDto {
    @IsString({ message: 'El token debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El token es requerido' })
    token: string;
  }