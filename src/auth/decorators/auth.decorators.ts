import { SetMetadata, createParamDecorator, ExecutionContext, UseGuards, applyDecorators } from '@nestjs/common';
import { User } from '../../users/entities/user.entity';
import { JwtAuthGuard } from '../guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';

// Decorador para marcar rutas como públicas
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Decorador para definir roles requeridos
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Decorador para obtener el usuario actual desde el request
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);

// Decorador para requerir autenticación y roles específicos
export const Auth = (...roles: string[]) => {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    roles.length ? Roles(...roles) : SetMetadata('__dummy', true),
  );
};