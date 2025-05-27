<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descripción

Este proyecto es una API de gestión de usuarios construida con el framework [NestJS](https://nestjs.com/), que utiliza TypeScript para crear aplicaciones del lado del servidor eficientes y escalables.

## Configuración del Proyecto

Para configurar el proyecto, primero instala las dependencias necesarias:

```bash
$ npm install
```

## Compilar y ejecutar el proyecto

Para compilar y ejecutar el proyecto, puedes usar los siguientes comandos:

```bash
# desarrollo
$ npm run start

# modo observación
$ npm run start:dev

# modo producción
$ npm run start:prod
```

## Pruebas

Para ejecutar las pruebas, utiliza los siguientes comandos:

```bash
# pruebas unitarias
$ npm run test

# pruebas e2e
$ npm run test:e2e

# cobertura de pruebas
$ npm run test:cov
```

## Despliegue

Para desplegar la aplicación en producción, sigue los pasos indicados en la [documentación de despliegue](https://docs.nestjs.com/deployment). Si buscas una plataforma en la nube para desplegar tu aplicación NestJS, considera usar [Railway](https://railway.app/), que facilita el despliegue con unos pocos pasos sencillos.

## Recursos

- Visita la [Documentación de NestJS](https://docs.nestjs.com) para aprender más sobre el framework.
- Para preguntas y soporte, visita nuestro [canal de Discord](https://discord.gg/G7Qnnhy).
- Para obtener más experiencia práctica, consulta nuestros [cursos oficiales](https://courses.nestjs.com/).

## Soporte

Nest es un proyecto de código abierto con licencia MIT. Puede crecer gracias a los patrocinadores y al apoyo de la comunidad. Si deseas unirte, por favor [lee más aquí](https://docs.nestjs.com/support).

## Mantente en contacto

- Autor - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Sitio web - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Licencia

Nest tiene licencia [MIT](https://github.com/nestjs/nest/blob/master/LICENSE).

## Endpoints de la API

### Registro de Usuario

- **URL**: `/users`
- **Método**: `POST`
- **Roles permitidos**: `PUBLIC`
- **Cuerpo de la solicitud**:

```json
{
  "email": "usuario@example.com",
  "password": "contraseñaSegura",
  "firstName": "Nombre",
  "lastName": "Apellido",
  "phoneNumber": "+1234567890",
  "avatar": "urlAvatar"
}
```
- **Descripción**: Este endpoint permite a los nuevos usuarios registrarse en el sistema proporcionando la información requerida.

### Obtener todos los usuarios con paginación

- **URL**: `/users`
- **Método**: `GET`
- **Roles permitidos**: `ADMIN`, `MODERATOR`
- **Parámetros de consulta opcionales**:
  - `page`: Número de página
  - `limit`: Número de elementos por página
  - `search`: Término de búsqueda
  - `status`: Estado del usuario
  - `role`: Rol del usuario

### Obtener estadísticas de usuarios

- **URL**: `/users/stats`
- **Método**: `GET`
- **Roles permitidos**: `ADMIN`

### Obtener mi perfil

- **URL**: `/users/me`
- **Método**: `GET`

### Obtener un usuario por ID

- **URL**: `/users/:id`
- **Método**: `GET`
- **Roles permitidos**: `ADMIN`, `MODERATOR`

### Actualizar mi perfil

- **URL**: `/users/me`
- **Método**: `PATCH`
- **Cuerpo de la solicitud**:

```json
{
  "firstName": "NuevoNombre",
  "lastName": "NuevoApellido",
  "phoneNumber": "+0987654321",
  "avatar": "nuevaUrlAvatar"
}
```

### Actualizar un usuario por ID

- **URL**: `/users/:id`
- **Método**: `PATCH`
- **Roles permitidos**: `ADMIN`
- **Cuerpo de la solicitud**:

```json
{
  "email": "nuevoEmail@example.com",
  "firstName": "NuevoNombre",
  "lastName": "NuevoApellido",
  "phoneNumber": "+0987654321",
  "avatar": "nuevaUrlAvatar",
  "status": "ACTIVE",
  "roleIds": ["roleId1", "roleId2"]
}
```

### Actualizar el estado de un usuario por ID

- **URL**: `/users/:id/status`
- **Método**: `PATCH`
- **Roles permitidos**: `ADMIN`, `MODERATOR`
- **Cuerpo de la solicitud**:

```json
{
  "status": "INACTIVE"
}
```

### Asignar roles a un usuario por ID

- **URL**: `/users/:id/roles`
- **Método**: `PATCH`
- **Roles permitidos**: `ADMIN`
- **Cuerpo de la solicitud**:

```json
{
  "roleIds": ["roleId1", "roleId2"]
}
```

### Eliminar un usuario por ID

- **URL**: `/users/:id`
- **Método**: `DELETE`
- **Roles permitidos**: `ADMIN`

### Desactivar un usuario por ID

- **URL**: `/users/:id/soft-delete`
- **Método**: `PATCH`
- **Roles permitidos**: `ADMIN`

## Endpoint de Login

El endpoint de login permite a los usuarios autenticarse en el sistema.

- **URL**: `/auth/login`
- **Método**: `POST`
- **Cuerpo de la solicitud**:
  ```json
  {
    "email": "usuario@example.com",
    "password": "tu_contraseña"
  }
  ```
- **Respuesta exitosa**:
  ```json
  {
    "accessToken": "token_de_acceso"
  }
  ```
- **Descripción**: Este endpoint verifica las credenciales del usuario y devuelve un token de acceso si la autenticación es exitosa.
