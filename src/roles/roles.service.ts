import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Like } from 'typeorm';
  
  import { Role } from './entities/role.entity';
  import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
  
  export interface RolePaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }
  
  // Definir permisos disponibles en el sistema
  export const AVAILABLE_PERMISSIONS = {
    // Usuarios
    'users:read': 'Leer usuarios',
    'users:create': 'Crear usuarios',
    'users:update': 'Actualizar usuarios',
    'users:delete': 'Eliminar usuarios',
    'users:manage_roles': 'Gestionar roles de usuarios',
    'users:manage_status': 'Gestionar estado de usuarios',
  
    // Roles
    'roles:read': 'Leer roles',
    'roles:create': 'Crear roles',
    'roles:update': 'Actualizar roles',
    'roles:delete': 'Eliminar roles',
    'roles:assign_permissions': 'Asignar permisos a roles',
  
    // Sistema
    'system:admin': 'Administración completa del sistema',
    'system:stats': 'Ver estadísticas del sistema',
    'system:logs': 'Ver logs del sistema',
  
    // Reportes
    'reports:view': 'Ver reportes',
    'reports:export': 'Exportar reportes',
  };
  
  @Injectable()
  export class RolesService {
    constructor(
      @InjectRepository(Role)
      private roleRepository: Repository<Role>,
    ) {}
  
    async create(createRoleDto: CreateRoleDto): Promise<Role> {
      const { name, description, permissions, isActive } = createRoleDto;
  
      // Verificar si el rol ya existe
      const existingRole = await this.roleRepository.findOne({
        where: { name: name.toUpperCase() },
      });
  
      if (existingRole) {
        throw new ConflictException('El rol con este nombre ya existe');
      }
  
      // Validar permisos si se proporcionan
      if (permissions && permissions.length > 0) {
        const invalidPermissions = permissions.filter(
          permission => !Object.keys(AVAILABLE_PERMISSIONS).includes(permission),
        );
  
        if (invalidPermissions.length > 0) {
          throw new BadRequestException(
            `Permisos inválidos: ${invalidPermissions.join(', ')}`,
          );
        }
      }
  
      // Crear rol
      const role = this.roleRepository.create({
        name: name.toUpperCase(),
        description,
        permissions: permissions || [],
        isActive: isActive !== undefined ? isActive : true,
      });
  
      return this.roleRepository.save(role);
    }
  
    async findAll(options: RolePaginationOptions = {}) {
      const { page = 1, limit = 10, search, isActive } = options;
  
      const queryBuilder = this.roleRepository
        .createQueryBuilder('role')
        .leftJoinAndSelect('role.users', 'user')
        .orderBy('role.createdAt', 'DESC');
  
      // Aplicar filtros
      if (search) {
        queryBuilder.andWhere(
          '(role.name ILIKE :search OR role.description ILIKE :search)',
          { search: `%${search}%` },
        );
      }
  
      if (isActive !== undefined) {
        queryBuilder.andWhere('role.isActive = :isActive', { isActive });
      }
  
      // Aplicar paginación
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
  
      const [roles, total] = await queryBuilder.getManyAndCount();
  
      // Agregar conteo de usuarios por rol
      const rolesWithUserCount = roles.map(role => ({
        ...role,
        userCount: role.users ? role.users.length : 0,
        users: undefined, // Remover la lista completa de usuarios para optimizar
      }));
  
      return {
        data: rolesWithUserCount,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string): Promise<Role> {
      const role = await this.roleRepository.findOne({
        where: { id },
        relations: ['users'],
      });
  
      if (!role) {
        throw new NotFoundException('Rol no encontrado');
      }
  
      return role;
    }
  
    async findByName(name: string): Promise<Role | null> {
      return this.roleRepository.findOne({
        where: { name: name.toUpperCase() },
        relations: ['users'],
      });
    }
  
    async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
      const role = await this.findOne(id);
  
      // Verificar nombre único si se está cambiando
      if (updateRoleDto.name && updateRoleDto.name.toUpperCase() !== role.name) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: updateRoleDto.name.toUpperCase() },
        });
  
        if (existingRole) {
          throw new ConflictException('El nombre del rol ya está en uso');
        }
      }
  
      // Validar permisos si se proporcionan
      if (updateRoleDto.permissions && updateRoleDto.permissions.length > 0) {
        const invalidPermissions = updateRoleDto.permissions.filter(
          permission => !Object.keys(AVAILABLE_PERMISSIONS).includes(permission),
        );
  
        if (invalidPermissions.length > 0) {
          throw new BadRequestException(
            `Permisos inválidos: ${invalidPermissions.join(', ')}`,
          );
        }
      }
  
      // Actualizar campos
      Object.assign(role, {
        ...updateRoleDto,
        name: updateRoleDto.name ? updateRoleDto.name.toUpperCase() : role.name,
      });
  
      return this.roleRepository.save(role);
    }
  
    async assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto): Promise<Role> {
      const role = await this.findOne(id);
  
      // Validar permisos
      const invalidPermissions = assignPermissionsDto.permissions.filter(
        permission => !Object.keys(AVAILABLE_PERMISSIONS).includes(permission),
      );
  
      if (invalidPermissions.length > 0) {
        throw new BadRequestException(
          `Permisos inválidos: ${invalidPermissions.join(', ')}`,
        );
      }
  
      role.permissions = assignPermissionsDto.permissions;
      return this.roleRepository.save(role);
    }
  
    async remove(id: string): Promise<void> {
      const role = await this.findOne(id);
  
      // Verificar que no sea un rol del sistema
      const systemRoles = ['ADMIN', 'USER', 'MODERATOR'];
      if (systemRoles.includes(role.name)) {
        throw new BadRequestException('No se puede eliminar un rol del sistema');
      }
  
      // Verificar que no tenga usuarios asignados
      if (role.users && role.users.length > 0) {
        throw new BadRequestException(
          'No se puede eliminar un rol que tiene usuarios asignados',
        );
      }
  
      await this.roleRepository.remove(role);
    }
  
    async toggleStatus(id: string): Promise<Role> {
      const role = await this.findOne(id);
  
      // Verificar que no sea un rol del sistema crítico
      if (role.name === 'ADMIN') {
        throw new BadRequestException('No se puede desactivar el rol de administrador');
      }
  
      role.isActive = !role.isActive;
      return this.roleRepository.save(role);
    }
  
    async getAvailablePermissions() {
      return {
        permissions: Object.entries(AVAILABLE_PERMISSIONS).map(([key, description]) => ({
          key,
          description,
        })),
      };
    }
  
    async getRoleStats() {
      const totalRoles = await this.roleRepository.count();
      const activeRoles = await this.roleRepository.count({
        where: { isActive: true },
      });
      const inactiveRoles = await this.roleRepository.count({
        where: { isActive: false },
      });
  
      // Estadísticas de uso de roles
      const roleUsage = await this.roleRepository
        .createQueryBuilder('role')
        .leftJoin('role.users', 'user')
        .select([
          'role.name as roleName',
          'role.description as roleDescription',
          'COUNT(user.id) as userCount',
        ])
        .groupBy('role.id, role.name, role.description')
        .orderBy('COUNT(user.id)', 'DESC')
        .getRawMany();
  
      return {
        total: totalRoles,
        active: activeRoles,
        inactive: inactiveRoles,
        usage: roleUsage,
      };
    }
  
    // Método para inicializar roles por defecto
    async initializeDefaultRoles() {
      const defaultRoles = [
        {
          name: 'ADMIN',
          description: 'Administrador del sistema con todos los permisos',
          permissions: Object.keys(AVAILABLE_PERMISSIONS),
        },
        {
          name: 'MODERATOR',
          description: 'Moderador con permisos limitados de gestión',
          permissions: [
            'users:read',
            'users:update',
            'users:manage_status',
            'roles:read',
            'reports:view',
          ],
        },
        {
          name: 'USER',
          description: 'Usuario estándar del sistema',
          permissions: [],
        },
      ];
  
      for (const roleData of defaultRoles) {
        const existingRole = await this.roleRepository.findOne({
          where: { name: roleData.name },
        });
  
        if (!existingRole) {
          const role = this.roleRepository.create(roleData);
          await this.roleRepository.save(role);
          console.log(`Rol ${roleData.name} creado exitosamente`);
        }
      }
    }
  }