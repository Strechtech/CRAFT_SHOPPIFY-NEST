<p align="center">
  <a href="https://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

<h1 align="center">CRAFT_SHOPPIFY API</h1>

<p align="center">API de comercio electrónico con NestJS, PostgreSQL, TypeORM, JWT y Socket.IO.</p>

## Descripción

Backend para registrar usuarios, autenticar clientes con JWT, gestionar productos,
subir imágenes y enviar mensajes en tiempo real. Todas las rutas HTTP usan el
prefijo `/api`.

## Requisitos

- Node.js y `pnpm`.
- Docker Desktop con Docker Compose.
- PostgreSQL 14.3 si no se usa Docker.

## Configuración

Copia `.env template` como `.env` en la raíz:

```dotenv
STAGE=dev
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=TesloDB
DB_USERNAME=postgres
DB_PASSWORD=postgress1234
HOST_API=http://localhost:3000/api
JWT_SECRET_KEY=secretprimary2026
```

| Variable | Descripción |
| --- | --- |
| `STAGE` | Con `prod` activa SSL en TypeORM. |
| `PORT` | Puerto HTTP; por defecto `3000`. |
| `DB_HOST`, `DB_PORT` | Conexión a PostgreSQL. |
| `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Credenciales de PostgreSQL. |
| `HOST_API` | Base usada para construir URLs de imágenes. |
| `JWT_SECRET_KEY` | Clave para firmar y validar tokens JWT. |

Los valores anteriores son solo para desarrollo. No uses esos secretos en
producción ni publiques `.env`.

## Instalación y ejecución

```bash
pnpm install
docker compose up -d
pnpm start:dev
```

PostgreSQL se ejecuta en `CRAFTDB`, publica `5432:5432` y persiste sus datos
en `./postgres`. TypeORM usa `synchronize: true` durante el desarrollo.

```bash
docker compose ps
docker compose logs db
docker compose down
```

URLs locales: API `http://localhost:3000/api`, Swagger
`http://localhost:3000/api` e imágenes en
`http://localhost:3000/api/files/product/:imageName`.

## Autenticación

1. `POST /api/auth/register` crea un usuario con rol `user`.
2. `POST /api/auth/login` devuelve un JWT.
3. Las rutas protegidas reciben `Authorization: Bearer <token>`.
4. `JwtStrategy` rechaza tokens inválidos o usuarios inactivos.
5. `UserRoleGuard` valida roles cuando corresponde.

Las contraseñas deben tener entre 6 y 50 caracteres, con mayúscula, minúscula
y número. Se almacenan con `bcrypt`; el hash no se devuelve ni se muestra en
Swagger. Roles disponibles: `admin`, `user` y `super-user`.

### Configuración de `AuthGuard`

El decorador `@Auth()` combina el `AuthGuard()` de Passport con
`UserRoleGuard`. Por eso, cada módulo que contenga un controlador con
`@Auth()` debe importar `AuthModule`; este módulo registra y exporta
`PassportModule`, `JwtModule` y `JwtStrategy`.

Actualmente la dependencia está configurada en:

- `AuthModule`: login, comprobación de sesión y rutas privadas.
- `ProductsModule`: creación, actualización y eliminación de productos.
- `FilesModule`: subida de imágenes.
- `SeedModule`: reservado para futuras protecciones del seed; el endpoint
  permanece público para permitir el bootstrap inicial.

Si aparece este error al iniciar:

```text
In order to use "defaultStrategy", please, ensure to import PassportModule
```

revisa que el módulo del controlador importe `AuthModule` y que no se use
`AuthGuard()` desde un módulo aislado sin esa dependencia.

## Seed

`GET /api/seed` elimina usuarios y productos y carga
`src/seed/data/seed-data.ts`:

```bash
curl http://localhost:3000/api/seed
```

Es público únicamente para inicializar una base vacía y es destructivo. Debe
deshabilitarse o protegerse antes de producción.

| Email | Contraseña | Roles |
| --- | --- | --- |
| `test1@google.com` | `Abc1234` | `admin` |
| `test2@google.com` | `Abc1234` | `user`, `super` |

`super` no equivale a `super-user` en los guards actuales.

## API HTTP

### Autenticación

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Público |
| `POST` | `/api/auth/login` | Público |
| `GET` | `/api/auth/check-status` | JWT |
| `GET` | `/api/auth/private` | JWT |
| `GET` | `/api/auth/private2` | JWT + `admin`, `user` o `super-user` |
| `GET` | `/api/auth/private3` | JWT + `admin`, `user` o `super-user` |

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@google.com","password":"Abc1234"}'
```

### Productos

| Método | Ruta | Acceso |
| --- | --- | --- |
| `GET` | `/api/products?limit=10&offset=0` | Público |
| `GET` | `/api/products/:term` | Público; UUID, título o slug |
| `POST` | `/api/products` | JWT |
| `PATCH` | `/api/products/:id` | JWT + `admin` |
| `DELETE` | `/api/products/:id` | JWT + `admin` |

Crear producto requiere `title` y `gender`. `gender` acepta `men`, `women`,
`kid` o `unisex`. Los demás campos son opcionales; `images` debe ser un array
de URLs válidas.

```json
{
  "title": "Camiseta CRAFT",
  "gender": "men",
  "price": 35,
  "stock": 10,
  "sizes": ["M", "L"],
  "tags": ["shirt"],
  "images": ["https://example.com/product.jpg"]
}
```

### Archivos

| Método | Ruta | Acceso |
| --- | --- | --- |
| `POST` | `/api/files/product` | JWT; multipart con campo `file` |
| `GET` | `/api/files/product/:imageName` | Público |

```bash
curl -X POST http://localhost:3000/api/files/product \
  -H "Authorization: Bearer <token>" \
  -F "file=@./producto.jpg"
```

Las imágenes se guardan en `static/products`. La respuesta devuelve
`secureUrl` para usarla en `images`.

## WebSocket

Socket.IO exige el JWT en `authorization` durante el handshake:

```ts
const socket = io("http://localhost:3000", {
  extraHeaders: { authorization: token }
});
```

| Evento | Dirección | Payload |
| --- | --- | --- |
| `clients-updated` | Servidor -> clientes | `string[]` con IDs conectados |
| `message-from-client` | Cliente -> servidor | `{ "message": "Hola" }` |
| `message-from-server` | Servidor -> clientes | `{ "fullName": "...", "message": "..." }` |

Solo se registran usuarios existentes y activos. Una nueva conexión del mismo
usuario desconecta la anterior.

## Swagger

Swagger documenta operaciones, DTOs, parámetros, respuestas, multipart y el
esquema `access-token` para Bearer JWT en autenticación, productos, archivos y
seed. Usa **Authorize** con el token JWT. La URL actual es:

```text
http://localhost:3000/api
```

## Comandos

| Comando | Uso |
| --- | --- |
| `pnpm start:dev` | Desarrollo con recarga. |
| `pnpm start` | Ejecutar la aplicación compilada. |
| `pnpm build` | Compilar en `dist/`. |
| `pnpm lint` | Ejecutar ESLint. |
| `pnpm format` | Formatear TypeScript. |
| `pnpm test` | Pruebas unitarias. |
| `pnpm test:e2e` | Pruebas end-to-end. |
| `pnpm test:cov` | Pruebas con cobertura. |

## Estructura

```text
src/
├── auth/          Registro, login, JWT, guards, roles y User
├── products/      CRUD, DTOs y Product/ProductImage
├── files/         Subida protegida y entrega pública de imágenes
├── message-ws/    Gateway, eventos y DTO de Socket.IO
├── seed/          Datos iniciales y bootstrap
├── common/        DTOs compartidos y paginación
├── app.module.ts  TypeORM y módulos
└── main.ts        Prefijo /api, validación y Swagger
```

## Producción

- Cambia `JWT_SECRET_KEY` y todas las credenciales.
- Deshabilita o protege `/api/seed`.
- Sustituye `synchronize: true` por migraciones.
- Configura SSL y `STAGE=prod` según PostgreSQL.
- Restringe CORS; Socket.IO usa CORS abierto actualmente.