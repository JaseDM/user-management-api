import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository, Like, In } from 'typeorm';
  import * as bcrypt from 'bcryptjs';
  import { ConfigService } from '@nestjs/config';
  
  import { User, UserStatus } from './entities/user.entity';
  import { Role } from '../roles/entities/role.entity';
  import {
    CreateUserDto,
    UpdateUserDto,
    AssignRolesDto,
    UpdateUserStatusDto,
  } from './dto/user.dto';
  
  export interface PaginationOptions {
    page?: number;
    limit?: number;
    search?: string;
    status?: UserStatus;
    role?: string;
  }
  
  @Injectable()
  export class UsersService {
    constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
      @InjectRepository(Role)
      private roleRepository: Repository<Role>,
      private configService: ConfigService,
    ) {}
  
    async create(createUserDto: CreateUserDto): Promise<User> {
      const { email, firstName, lastName, phoneNumber, status, roleIds } = createUserDto;
  
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
  
      if (existingUser) {
        throw new ConflictException('El usuario con este email ya existe');
      }
  
      // Generar contraseña temporal
      const temporaryPassword = this.generateTemporaryPassword();
      const saltRounds = Number(this.configService.get<number>('BCRYPT_ROUNDS', 10));
      const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);
  
      // Obtener roles
      let roles: Role[] = [];
      if (roleIds && roleIds.length > 0) {
        roles = await this.roleRepository.findBy({
          id: In(roleIds),
        });
  
        if (roles.length !== roleIds.length) {
          throw new BadRequestException('Uno o más roles no existen');
        }
      } else {
        // Asignar rol por defecto
        const defaultRole = await this.roleRepository.findOne({
          where: { name: 'USER' },
        });
  
        if (defaultRole) {
          roles = [defaultRole];
        }
      }
  
      // Crear usuario
      const user = this.userRepository.create({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phoneNumber,
        status: status || UserStatus.ACTIVE,
        roles,
      });
  
      const savedUser = await this.userRepository.save(user);
  
      // En un entorno real, enviarías la contraseña temporal por email
      console.log(`Contraseña temporal para ${email}: ${temporaryPassword}`);
  
      return savedUser;
    }
  
    async findAll(options: PaginationOptions = {}) {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        role,
      } = options;
  
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.roles', 'role')
        .orderBy('user.createdAt', 'DESC');
  
      // Aplicar filtros
      if (search) {
        queryBuilder.andWhere(
          '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
          { search: `%${search}%` },
        );
      }
  
      if (status) {
        queryBuilder.andWhere('user.status = :status', { status });
      }
  
      if (role) {
        queryBuilder.andWhere('role.name = :role', { role });
      }
  
      // Aplicar paginación
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);
  
      const [users, total] = await queryBuilder.getManyAndCount();
  
      return {
        data: users.map(user => this.sanitizeUser(user)),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    }
  
    async findOne(id: string): Promise<User> {
      const user = await this.userRepository.findOne({
        where: { id },
        relations: ['roles'],
      });
  
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }
  
      return user;
    }
  
    async findByEmail(email: string): Promise<User | null> {
      return this.userRepository.findOne({
        where: { email },
        relations: ['roles'],
      });
    }
  
    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const user = await this.findOne(id);
  
      // Verificar email único si se está cambiando
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({
          where: { email: updateUserDto.email },
        });
  
        if (existingUser) {
          throw new ConflictException('El email ya está en uso');
        }
      }
  
      // Actualizar roles si se proporcionan
      if (updateUserDto.roleIds) {
        const roles = await this.roleRepository.findBy({
          id: In(updateUserDto.roleIds),
        });
  
        if (roles.length !== updateUserDto.roleIds.length) {
          throw new BadRequestException('Uno o más roles no existen');
        }
  
        user.roles = roles;
      }
  
      // Actualizar otros campos
      Object.assign(user, {
        ...updateUserDto,
        roleIds: undefined, // Remover roleIds del objeto final
      });
  
      return this.userRepository.save(user);
    }
  
    async updateStatus(id: string, updateStatusDto: UpdateUserStatusDto): Promise<User> {
      const user = await this.findOne(id);
      user.status = updateStatusDto.status;
      return this.userRepository.save(user);
    }
  
    async assignRoles(id: string, assignRolesDto: AssignRolesDto): Promise<User> {
      const user = await this.findOne(id);
  
      const roles = await this.roleRepository.findBy({
        id: In(assignRolesDto.roleIds),
      });
  
      if (roles.length !== assignRolesDto.roleIds.length) {
        throw new BadRequestException('Uno o más roles no existen');
      }
  
      user.roles = roles;
      return this.userRepository.save(user);
    }
  
    async remove(id: string): Promise<void> {
      const user = await this.findOne(id);
      await this.userRepository.remove(user);
    }
  
    async softDelete(id: string): Promise<User> {
      const user = await this.findOne(id);
      user.status = UserStatus.INACTIVE;
      return this.userRepository.save(user);
    }
  
    async getUserStats() {
      const totalUsers = await this.userRepository.count();
      const activeUsers = await this.userRepository.count({
        where: { status: UserStatus.ACTIVE },
      });
      const inactiveUsers = await this.userRepository.count({
        where: { status: UserStatus.INACTIVE },
      });
      const suspendedUsers = await this.userRepository.count({
        where: { status: UserStatus.SUSPENDED },
      });
  
      const roleStats = await this.userRepository
        .createQueryBuilder('user')
        .leftJoin('user.roles', 'role')
        .select('role.name', 'roleName')
        .addSelect('COUNT(user.id)', 'userCount')
        .groupBy('role.name')
        .getRawMany();
  
      return {
        total: totalUsers,
        active: activeUsers,
        inactive: inactiveUsers,
        suspended: suspendedUsers,
        byRole: roleStats,
      };
    }
  
    private sanitizeUser(user: User) {
      const { password, passwordResetToken, emailVerificationToken, ...result } = user;
      return result;
    }
  
    private generateTemporaryPassword(): string {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
      let password = '';
      
      // Asegurar que tenga al menos un carácter de cada tipo
      password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Mayúscula
      password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
      password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
      password += '@$!%*?&'[Math.floor(Math.random() * 7)]; // Especial
      
      // Completar hasta 12 caracteres
      for (let i = 4; i < 12; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      
      // Mezclar caracteres
      return password.split('').sort(() => Math.random() - 0.5).join('');
    }
  }