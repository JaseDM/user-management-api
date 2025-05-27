-- Script de inicialización de datos para la base de datos

-- Insertar roles
INSERT INTO roles (id, name) VALUES
  (uuid_generate_v4(), 'ADMIN'),
  (uuid_generate_v4(), 'USER'),
  (uuid_generate_v4(), 'MODERATOR');

-- Insertar usuarios
INSERT INTO users (id, username, password, role_id) VALUES
  (uuid_generate_v4(), 'admin', 'adminpassword', (SELECT id FROM roles WHERE name = 'ADMIN')),
  (uuid_generate_v4(), 'user', 'userpassword', (SELECT id FROM roles WHERE name = 'USER'));