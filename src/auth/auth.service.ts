import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
    ConflictException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  import * as bcrypt from 'bcryptjs';
  import { ConfigService } from '@nestjs/config';
  import { randomBytes } from 'crypto';
  
  import { User, UserStatus } from '../users/entities/user.entity';
  import { Role } from '../roles/entities/role.entity';
  import {
    LoginDto,
    RegisterDto,
    ChangePasswordDto,
    ForgotPasswordDto,
    ResetPasswordDto,
  } from './dto/auth.dto';
  
  export interface JwtPayload {
    sub: string;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
  }
  
  @Injectable()
  export class AuthService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      @InjectRepository(Role)
      private roleRepository: Repository<Role>,
      private jwtService: JwtService,
      private configService: ConfigService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      const { email, password, firstName, lastName, phoneNumber } = registerDto;
  
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
  
      if (existingUser) {
        throw new ConflictException('El usuario con este email ya existe');
      }
  
      // Encriptar contraseña
      const saltRounds = Number(this.configService.get<number>('BCRYPT_ROUNDS',10));
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Obtener rol por defecto (USER)
      const defaultRole = await this.roleRepository.findOne({
        where: { name: 'USER' },
      });
  
      if (!defaultRole) {
        throw new BadRequestException('Rol por defecto no encontrado');
      }
  
      // Crear usuario inactivo por defecto
      const user = this.userRepository.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phoneNumber,
        roles: [defaultRole],
        status: UserStatus.INACTIVE,
        emailVerified: false,
        emailVerificationToken: this.generateVerificationToken(),
      });
  
      const savedUser = await this.userRepository.save(user);
  
      // Generar token JWT
      const payload: JwtPayload = {
        sub: savedUser.id,
        email: savedUser.email,
        roles: savedUser.getRoleNames(),
      };
  
      const accessToken = this.jwtService.sign(payload);
  
      return {
        user: savedUser,
        accessToken,
        message: 'Usuario registrado exitosamente',
      };
    }
  
    async login(loginDto: LoginDto) {
      const { email, password } = loginDto;
  
      // Buscar usuario con roles
      const user = await this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });
  
      if (!user) {
        throw new UnauthorizedException('Email o contraseña incorrectos');
      }
  
      // Verificar estado del usuario
      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Usuario inactivo o suspendido');
      }
  
      // Verificar contraseña
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email o contraseña incorrectos');
      }
  
      // Actualizar último login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);
  
      // Generar token JWT
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        roles: user.getRoleNames(),
      };
  
      const accessToken = this.jwtService.sign(payload);
  
      return {
        user: user,
        accessToken,
        message: 'Login exitoso',
      };
    }
  
    async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
      const { currentPassword, newPassword } = changePasswordDto;
  
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
  
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
  
      // Verificar contraseña actual
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
  
      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }
  
      // Verificar que la nueva contraseña no sea igual a la actual
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException(
          'La nueva contraseña debe ser diferente a la actual',
        );
      }
  
      // Encriptar nueva contraseña
      const saltRounds = Number(this.configService.get<number>('BCRYPT_ROUNDS', 10));
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  
      // Actualizar contraseña
      user.password = hashedNewPassword;
      await this.userRepository.save(user);
  
      return {
        message: 'Contraseña cambiada exitosamente',
      };
    }
  
    async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
      const { email } = forgotPasswordDto;
  
      const user = await this.userRepository.findOne({
        where: { email },
      });
  
      if (!user) {
        // Por seguridad, no revelamos si el email existe o no
        return {
          message: 'Si el email existe, se ha enviado un enlace de recuperación',
        };
      }
  
      // Generar token y fecha de expiración
      const resetToken = this.generateResetToken();
      const resetExpires = new Date();
      resetExpires.setHours(resetExpires.getHours() + 1); // Token válido por 1 hora
  
      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetExpires;
      await this.userRepository.save(user);
  
      // Aquí implementarías el envío del email
      // await this.mailService.sendPasswordResetEmail(user.email, resetToken);
  
      return {
        message: 'Si el email existe, se ha enviado un enlace de recuperación',
      };
    }
  
    async resetPassword(resetPasswordDto: ResetPasswordDto) {
      const { token, newPassword } = resetPasswordDto;
  
      const user = await this.userRepository.findOne({
        where: {
          passwordResetToken: token,
        },
      });
  
      if (!user || !user.passwordResetExpires) {
        throw new BadRequestException('Token de recuperación inválido');
      }
  
      // Verificar si el token ha expirado
      if (user.passwordResetExpires < new Date()) {
        throw new BadRequestException('Token de recuperación expirado');
      }
  
      // Encriptar nueva contraseña
      const saltRounds = Number(this.configService.get<number>('BCRYPT_ROUNDS', 10));
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
  
      // Actualizar contraseña y limpiar tokens
      user.password = hashedNewPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await this.userRepository.save(user);
  
      return {
        message: 'Contraseña restablecida exitosamente',
      };
    }
  
    async verifyEmail(token: string) {
      if (!token) {
        throw new BadRequestException('Token de verificación requerido');
      }
      const user = await this.userRepository.findOne({ where: { emailVerificationToken: token } });
      if (!user) {
        throw new BadRequestException('Token de verificación inválido o expirado');
      }
      if (user.emailVerified) {
        return { message: 'El correo ya ha sido verificado previamente.' };
      }
    user.emailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.emailVerificationToken = undefined;
      await this.userRepository.save(user);
      return { message: 'Correo verificado exitosamente. Ya puedes iniciar sesión.' };
    }
  
    async validateUser(payload: JwtPayload): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
        relations: ['roles'],
      });
  
      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException();
      }
  
      return user;
    }
  
    private generateVerificationToken(): string {
      return randomBytes(32).toString('hex');
    }
  
    private generateResetToken(): string {
      return randomBytes(32).toString('hex');
    }
  }