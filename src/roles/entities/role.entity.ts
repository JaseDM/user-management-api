import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  
  @Entity('roles')
  export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true, length: 50 })
    name: string;
  
    @Column({ length: 255, nullable: true })
    description?: string;
  
    @Column('simple-array', { nullable: true })
    permissions: string[];
  
    @Column({ default: true })
    isActive: boolean;
  
    @ManyToMany(() => User, (user) => user.roles)
    users: User[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Método helper para verificar si el rol tiene un permiso específico
    hasPermission(permission: string): boolean {
      return this.permissions.includes(permission);
    }
  }