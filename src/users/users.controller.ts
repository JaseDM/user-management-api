import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseGuards,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UsersService, PaginationOptions } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  AssignRolesDto,
  UpdateUserStatusDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, UserStatus } from './entities/user.entity';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      message: 'Usuario creado exitosamente',
      user,
    };
  }

  @Get()
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
  @ApiQuery({ name: 'search', required: false, description: 'Search term' })
  @ApiQuery({ name: 'status', required: false, description: 'User status' })
  @ApiQuery({ name: 'role', required: false, description: 'User role' })
  @ApiResponse({ status: 200, description: 'List of users.' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: UserStatus,
    @Query('role') role?: string,
  ) {
    const options: PaginationOptions = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
      role,
    };

    return this.usersService.findAll(options);
  }

  @Get('stats')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics.' })
  async getStats() {
    return this.usersService.getUserStats();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'User profile.' })
  async getMyProfile(@GetUser() user: User) {
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        status: user.status,
        emailVerified: user.emailVerified,
        lastLoginAt: user.lastLoginAt,
        roles: user.roles.map(role => ({
          id: role.id,
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        })),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  @Get(':id')
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User details.' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.findOne(id);
    return {
      user,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.' })
  async updateMyProfile(
    @GetUser('id') userId: string,
    @Body() updateUserDto: Omit<UpdateUserDto, 'status' | 'roleIds'>,
  ) {
    // Los usuarios solo pueden actualizar ciertos campos de su propio perfil
    const allowedFields = {
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      phoneNumber: updateUserDto.phoneNumber,
      avatar: updateUserDto.avatar,
    };

    const user = await this.usersService.update(userId, allowedFields);
    return {
      message: 'Perfil actualizado exitosamente',
      user,
    };
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully.' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      message: 'Usuario actualizado exitosamente',
      user,
    };
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'MODERATOR')
  @ApiOperation({ summary: 'Update user status by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({ status: 200, description: 'User status updated successfully.' })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.usersService.updateStatus(id, updateStatusDto);
    return {
      message: 'Estado de usuario actualizado exitosamente',
      user,
    };
  }

  @Patch(':id/roles')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Assign roles to a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiBody({ type: AssignRolesDto })
  @ApiResponse({ status: 200, description: 'Roles assigned successfully.' })
  @ApiBody({
    type: AssignRolesDto,
    examples: {
      example1: {
        summary: 'Ejemplo de asignación de roles',
        description: 'Ejemplo de cuerpo de solicitud para asignar roles a un usuario.',
        value: {
          roleIds: ['uuid-rol-1', 'uuid-rol-2']
        }
      }
    }
  })
  @Roles('ADMIN')
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    const user = await this.usersService.assignRoles(id, assignRolesDto);
    return {
      message: 'Roles asignados exitosamente',
      user,
    };
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully.' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.usersService.remove(id);
    return {
      message: 'Usuario eliminado exitosamente',
    };
  }

  @Patch(':id/soft-delete')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Soft delete a user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User soft deleted successfully.' })
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.usersService.softDelete(id);
    return {
      message: 'Usuario desactivado exitosamente',
      user,
    };
  }
}