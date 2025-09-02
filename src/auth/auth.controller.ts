import { Query } from '@nestjs/common';
import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    Get,
    Patch,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
  } from './dto/auth.dto';
  import { LocalAuthGuard } from './guards/local-auth.guard';
  import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
  import { Public } from './decorators/public.decorator';
  import { GetUser } from './decorators/get-user.decorator';
  import { User } from '../users/entities/user.entity';
  import { ApiBody } from '@nestjs/swagger';
  
  @Controller('auth')
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @Public()
    @Get('verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyEmail(@Query('token') token: string) {
      return this.authService.verifyEmail(token);
    }

    @Public()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({
      type: RegisterDto,
      examples: {
        example1: {
          summary: 'Ejemplo de registro',
          description: 'Ejemplo de cuerpo de solicitud para registrar un nuevo usuario.',
          value: {
            email: 'usuario@example.com',
            password: 'ContraseñaSegura123!',
            firstName: 'Nombre',
            lastName: 'Apellido',
            phoneNumber: '+1234567890'
          }
        }
      }
    })
    async register(@Body() registerDto: RegisterDto) {
      return this.authService.register(registerDto);
    }
  
    @Public()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiBody({
      type: LoginDto,
      examples: {
        example1: {
          summary: 'Ejemplo de inicio de sesión',
          description: 'Ejemplo de cuerpo de solicitud para iniciar sesión.',
          value: {
            email: 'usuario@example.com',
            password: 'ContraseñaSegura123!'
          }
        }
      }
    })
    async login(@Body() loginDto: LoginDto) {
      return this.authService.login(loginDto);
    }
  
  
    @Patch('change-password')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async changePassword(
      @GetUser('id') userId: string,
      @Body() changePasswordDto: ChangePasswordDto,
    ) {
      return this.authService.changePassword(userId, changePasswordDto);
    }
  
    @Public()
    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
      return this.authService.forgotPassword(forgotPasswordDto);
    }
  
    @Public()
    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
      return this.authService.resetPassword(resetPasswordDto);
    }
  
    @Get('validate-token')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async validateToken(@GetUser() user: User) {
      return {
        valid: true,
        user: {
          id: user.id,
          email: user.email,
          roles: user.getRoleNames(),
        },
        message: 'Token válido',
      };
    }
  
    // El endpoint de refresh token se ha eliminado porque su implementación
    // era insegura. Una implementación correcta requiere un token de refresco
    // separado y un mecanismo de almacenamiento seguro, lo cual está fuera
    // del alcance de esta revisión.
  }