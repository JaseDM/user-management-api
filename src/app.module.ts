import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth/jwt-auth.guard';

import { User } from './users/entities/user.entity';
import { Role } from './roles/entities/role.entity';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 10 }],
    }),
    HealthModule,

    // Variables de entorno (en producción Plesk inyecta envs; no hace falta .env)
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? undefined : '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';

        // Preferimos URL si existe
        const url = config.get<string>('DATABASE_URL');

        // SSL solo si DB_SSL=true (útil para cloud/managed DB)
        const useSSL =
          config.get<string>('DB_SSL') === 'true' ||
          (url?.includes('sslmode=require') ?? false);

        // Por defecto, rechazar certificados no autorizados (más seguro)
        const rejectUnauthorized =
          config.get<string>('DB_SSL_REJECT_UNAUTHORIZED') !== 'false';

        const common = {
          type: 'postgres' as const,
          entities: [User, Role],
          // Nunca sincronices en producción sin saber lo que haces
          synchronize: config.get<string>('DB_SYNC') === 'true',
          logging: false,
          autoLoadEntities: true,
        };

        const sslOptions = useSSL ? { rejectUnauthorized } : undefined;

        if (url) {
          return {
            ...common,
            url,
            ssl: sslOptions,
            // Extras útiles para evitar timeouts esporádicos
            extra: { keepAlive: true },
          };
        }

        // Fallback a variables sueltas (Docker local, Plesk sin DATABASE_URL, etc.)
        return {
          ...common,
          host: config.get<string>('DATABASE_HOST') ?? 'postgres',
          port: Number(config.get<string>('DATABASE_PORT') ?? '5432'),
          username: config.get<string>('DATABASE_USER'),
          password: config.get<string>('DATABASE_PASSWORD'),
          database: config.get<string>('DATABASE_NAME'),
          ssl: sslOptions,
          extra: { keepAlive: true },
        };
      },
      inject: [ConfigService],
    }),

    AuthModule,
    UsersModule,
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // El Guard JWT global se ha desactivado temporalmente para facilitar
    // la populación de la base de datos.
    // { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}