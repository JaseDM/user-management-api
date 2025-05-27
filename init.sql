-- Crear extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear enum para roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- Crear enum para estado de usuario
CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');