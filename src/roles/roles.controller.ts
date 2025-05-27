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
    ParseBoolPipe,
  } from '@nestjs/common';
  import { RolesService, RolePaginationOptions } from './roles.service';
  import { CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
  import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
  import { RolesGuard } from '../auth/guards/roles/roles.guard';
  import { Roles } from '../auth/decorators/roles.decorator';
  import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
  
  @Controller('roles')
  @UseGuards(JwtAuthGuard, RolesGuard)
  export class RolesController {
    constructor(private readonly rolesService: RolesService) {}
  
    @Post()
    @ApiTags('roles')
    @ApiOperation({ summary: 'Create a new role' })
    @ApiResponse({ status: 201, description: 'Role created successfully.' })
    @ApiBody({
      type: CreateRoleDto,
      examples: {
        example1: {
          summary: 'Ejemplo de creación de rol',
          description: 'Ejemplo de cuerpo de solicitud para crear un nuevo rol.',
          value: {
            name: 'Administrador',
            description: 'Rol con permisos administrativos'
          }
        }
      }
    })
    @Roles('ADMIN')
    async create(@Body() createRoleDto: CreateRoleDto) {
      const role = await this.rolesService.create(createRoleDto);
      return {
        message: 'Rol creado exitosamente',
        role,
      };
    }
  
    @Get()
    @ApiOperation({ summary: 'Get all roles with pagination' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number' })
    @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page' })
    @ApiQuery({ name: 'search', required: false, description: 'Search term' })
    @ApiQuery({ name: 'isActive', required: false, description: 'Active status filter' })
    @ApiResponse({ status: 200, description: 'List of roles.' })
    @Roles('ADMIN', 'MODERATOR')
    async findAll(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('search') search?: string,
      @Query('isActive', new ParseBoolPipe({ optional: true })) isActive?: boolean,
    ) {
      const options: RolePaginationOptions = {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
        search,
        isActive,
      };
  
      return this.rolesService.findAll(options);
    }
  
    @Get('permissions')
    @ApiOperation({ summary: 'Get available permissions' })
    @ApiResponse({ status: 200, description: 'List of available permissions.' })
    @Roles('ADMIN')
    async getAvailablePermissions() {
      return this.rolesService.getAvailablePermissions();
    }
  
    @Get('stats')
    @ApiOperation({ summary: 'Get role statistics' })
    @ApiResponse({ status: 200, description: 'Role statistics.' })
    @Roles('ADMIN')
    async getStats() {
      return this.rolesService.getRoleStats();
    }
  
    @Get(':id')
    @ApiOperation({ summary: 'Get a role by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Role ID' })
    @ApiResponse({ status: 200, description: 'Role details.' })
    @Roles('ADMIN', 'MODERATOR')
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
      const role = await this.rolesService.findOne(id);
      return {
        role,
      };
    }
  
    @Patch(':id')
    @ApiOperation({ summary: 'Update a role by ID' })
    @ApiParam({ name: 'id', required: true, description: 'Role ID' })
    @ApiResponse({ status: 200, description: 'Role updated successfully.' })
    @ApiBody({
      type: UpdateRoleDto,
      examples: {
        example1: {
          summary: 'Ejemplo de actualización de rol',
          description: 'Ejemplo de cuerpo de solicitud para actualizar un rol.',
          value: {
            name: 'Administrador Actualizado',
            description: 'Rol con permisos administrativos actualizados'
          }
        }
      }
    })
    @Roles('ADMIN')
    async update(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateRoleDto: UpdateRoleDto,
    ) {
      const role = await this.rolesService.update(id, updateRoleDto);
      return {
        message: 'Rol actualizado exitosamente',
        role,
      };
    }
  
    @Patch(':id/permissions')
    @Roles('ADMIN')
    async assignPermissions(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() assignPermissionsDto: AssignPermissionsDto,
    ) {
      const role = await this.rolesService.assignPermissions(id, assignPermissionsDto);
      return {
        message: 'Permisos asignados exitosamente',
        role,
      };
    }
  
    @Patch(':id/toggle-status')
    @Roles('ADMIN')
    async toggleStatus(@Param('id', ParseUUIDPipe) id: string) {
      const role = await this.rolesService.toggleStatus(id);
      return {
        message: `Rol ${role.isActive ? 'activado' : 'desactivado'} exitosamente`,
        role,
      };
    }
  
    @Delete(':id')
    @Roles('ADMIN')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseUUIDPipe) id: string) {
      await this.rolesService.remove(id);
      return {
        message: 'Rol eliminado exitosamente',
      };
    }
  
    @Post('initialize-defaults')
    @Roles('ADMIN')
    async initializeDefaultRoles() {
      await this.rolesService.initializeDefaultRoles();
      return {
        message: 'Roles por defecto inicializados exitosamente',
      };
    }
  }