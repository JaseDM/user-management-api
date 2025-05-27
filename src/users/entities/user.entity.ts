import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { Exclude } from 'class-transformer';
  import { Role } from '../../roles/entities/role.entity';
  
  export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED',
  }
  
  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true, length: 100 })
    email: string;
  
    @Column({ length: 100 })
    firstName: string;
  
    @Column({ length: 100 })
    lastName: string;
  
    @Column()
    @Exclude()
    password: string;
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.ACTIVE,
    })
    status: UserStatus;
  
    @Column({ nullable: true })
    phoneNumber?: string;
  
    @Column({ nullable: true })
    avatar?: string;
  
    @Column({ default: false })
    emailVerified: boolean;
  
    @Column({ nullable: true })
    emailVerificationToken?: string;
  
    @Column({ nullable: true })
    passwordResetToken?: string;
  
    @Column({ nullable: true })
    passwordResetExpires?: Date;
  
    @Column({ nullable: true })
    lastLoginAt?: Date;
  
    @ManyToMany(() => Role, (role) => role.users, { eager: true })
    @JoinTable({
      name: 'user_roles',
      joinColumn: { name: 'user_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
    })
    roles: Role[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Método helper para verificar si el usuario tiene un rol específico
    hasRole(roleName: string): boolean {
      return this.roles.some((role) => role.name === roleName);
    }
  
    // Método helper para obtener nombres de roles
    getRoleNames(): string[] {
      return this.roles.map((role) => role.name);
    }
  }