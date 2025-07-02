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

@Module({
  imports: [
    ThrottlerModule.forRoot({
        throttlers: [
          {
            ttl: 60000,
            limit: 10,
          },
        ],
      }),

    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Configuración de TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        return isProduction
          ? {
              type: 'postgres',
              url: configService.get('DATABASE_URL'),
              entities: [User, Role],
              synchronize: true,
              logging: false,
              ssl: {
                rejectUnauthorized: false,
              },
            }
          : {
              type: 'postgres',
              host: configService.get('DATABASE_HOST'),
              port: +configService.get('DATABASE_PORT'),
              username: configService.get('DATABASE_USER'),
              password: configService.get('DATABASE_PASSWORD'),
              database: configService.get('DATABASE_NAME'),
              entities: [User, Role],
              synchronize: true, // ⚠️ Solo en desarrollo
              logging: false,
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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    //Aplicar JWT Guard globalmente (se puede sobrescribir en controladores específicos)
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
