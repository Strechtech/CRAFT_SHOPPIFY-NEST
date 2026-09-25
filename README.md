<p align="center">
  <a href="https://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="NestJS Logo" />
  </a>
</p>

# CRAFT_SHOPPIFY API

API REST para un e-commerce de productos, construida con NestJS, PostgreSQL y TypeORM. Incluye autenticacion JWT con roles, catalogo de productos, carga de imagenes, datos iniciales y mensajeria en tiempo real con Socket.IO.

## Requisitos

- Node.js compatible con el proyecto y `pnpm`.
- Docker Desktop o Docker Engine con Docker Compose.
- PostgreSQL 14.3 si no se utiliza el contenedor incluido.

## Puesta en marcha

1. Instalar dependencias:

  ```bash
  pnpm install
  ```

2. Crear `.env` en la raiz del proyecto. El repositorio incluye una plantilla llamada `.env template` (con espacio); puede copiarse como `.env` y ajustarse:

  ```bash
  cp ".env template" .env
  ```

  En PowerShell:

  ```powershell
  Copy-Item ".env template" .env
  ```

3. Iniciar PostgreSQL:

  ```bash
  docker compose up -d
  ```

4. Iniciar la API en modo desarrollo:

  ```bash
  pnpm start:dev
  ```

  La API queda disponible en `http://localhost:3000` y utiliza el prefijo global `/api`.

5. Cargar los datos iniciales, una vez iniciada la API:

  ```bash
  curl http://localhost:3000/api/seed
  ```

  Tambien se puede abrir `http://localhost:3000/api/seed` con un navegador.

## Variables de entorno

```dotenv
STAGE=dev
DB_PASSWORD=postgress1234
DB_NAME=TesloDB
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
HOST_API=http://localhost:3000/api
JWT_SECRET_KEY=secretprimary2026
```

`HOST_API` se utiliza para construir las URL publicas de las imagenes. En produccion debe reemplazarse la clave JWT y configurar credenciales seguras. Cuando `STAGE=prod`, TypeORM activa SSL.

## Documentacion interactiva

Swagger esta disponible en:

```text
http://localhost:3000/api
```

Desde Swagger se pueden consultar los esquemas y probar los endpoints. Para las rutas protegidas, enviar el JWT recibido en el login como token Bearer.

### Como autenticar peticiones

El login devuelve un campo `token`. Ese valor debe enviarse en las rutas protegidas con el header:

```http
Authorization: Bearer <token>
```

Ejemplo:

```bash
curl http://localhost:3000/api/auth/check-status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

## API REST

Todas las rutas comienzan con `/api`.

### Autenticacion

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Publico | Registra un usuario. La contrasena debe tener entre 6 y 50 caracteres, mayusculas, minusculas y un numero o caracter especial. |
| `POST` | `/auth/login` | Publico | Valida las credenciales y devuelve un JWT. |
| `GET` | `/auth/check-status` | JWT | Valida el usuario del token y devuelve un token renovado. |
| `GET` | `/auth/private` | JWT | Ruta de prueba que devuelve informacion del usuario y headers. |
| `GET` | `/auth/private2` | JWT | Ruta de prueba protegida por roles. |
| `GET` | `/auth/private3` | JWT | Ruta de prueba protegida por roles mediante el decorador `Auth`. |

Ejemplo de registro:

```json
{
  "email": "cliente@example.com",
  "password": "Abc1234",
  "fullName": "Cliente Demo"
}
```

La respuesta contiene el usuario creado sin la contrasena. Para iniciar sesion:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cliente@example.com","password":"Abc1234"}'
```

Ejemplo de respuesta de login:

```json
{
  "id": "uuid-del-usuario",
  "email": "cliente@example.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

`check-status` recibe el usuario desde el JWT y devuelve sus datos junto con un token renovado. Las rutas `private`, `private2` y `private3` son endpoints de prueba para comprobar autenticacion y autorizacion por roles.

Los roles disponibles son `user`, `admin` y `super-user`. Los usuarios nuevos reciben `user` por defecto.

### Productos

| Metodo | Ruta | Acceso | Descripcion |
| --- | --- | --- | --- |
| `GET` | `/products` | Publico | Lista productos paginados. Acepta `limit` y `offset`; por defecto `limit=10` y `offset=0`. |
| `GET` | `/products/:term` | Publico | Busca por UUID, titulo exacto o slug. |
| `POST` | `/products` | JWT | Crea un producto asociado al usuario autenticado. |
| `PATCH` | `/products/:id` | `admin` | Actualiza un producto por UUID. |
| `DELETE` | `/products/:id` | `admin` | Elimina un producto por UUID. |

Ejemplo de producto:

```json
{
  "title": "Camiseta de prueba",
  "price": 35,
  "description": "Camiseta de algodon",
  "stock": 10,
  "sizes": ["S", "M", "L"],
  "gender": "unisex",
  "tags": ["shirt", "basic"],
  "images": ["https://example.com/camiseta.jpg"]
}
```

`gender` admite `men`, `women`, `kid` y `unisex`. El `slug` se genera a partir del titulo si no se proporciona.

#### Listar productos

`limit` indica cuantos productos devolver y `offset` cuantos registros saltar. Ambos son opcionales, deben ser numeros positivos (excepto `offset`, que puede ser `0`) y se envian como query parameters:

```bash
curl "http://localhost:3000/api/products?limit=5&offset=10"
```

La peticion anterior devuelve hasta 5 productos comenzando desde la posicion 10. Sin parametros se usa `limit=10` y `offset=0`.

#### Buscar un producto

El parametro `term` puede ser el UUID, titulo exacto o slug del producto:

```bash
curl http://localhost:3000/api/products/men_quilted_shirt_jacket
curl http://localhost:3000/api/products/7b7e0b7c-0d8e-4b7e-9c2e-123456789abc
```

#### Crear un producto

Requiere un JWT valido. Los campos obligatorios son `title` y `gender`; el resto es opcional. `price` debe ser mayor que cero, `stock` un entero mayor que cero, `sizes` y `tags` son arreglos de texto, y cada valor de `images` debe ser una URL valida.

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title":"Camiseta de prueba",
    "price":35,
    "description":"Camiseta de algodon",
    "stock":10,
    "sizes":["S","M","L"],
    "gender":"unisex",
    "tags":["shirt","basic"],
    "images":["https://example.com/camiseta.jpg"]
  }'
```

#### Actualizar un producto

Requiere un usuario con rol `admin`. Todos los campos son opcionales porque `PATCH` permite enviar solo los valores que cambian. `id` debe ser un UUID:

```bash
curl -X PATCH http://localhost:3000/api/products/7b7e0b7c-0d8e-4b7e-9c2e-123456789abc \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token-admin>" \
  -d '{"price":39.99,"stock":8,"tags":["shirt","sale"]}'
```

Si se envia `images`, se reemplaza la lista completa de imagenes del producto.

#### Eliminar un producto

Requiere un usuario con rol `admin`. El unico parametro es el UUID del producto:

```bash
curl -X DELETE http://localhost:3000/api/products/7b7e0b7c-0d8e-4b7e-9c2e-123456789abc \
  -H "Authorization: Bearer <token-admin>"
```

### Archivos

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `POST` | `/files/product` | Recibe una imagen en el campo multipart `file` y devuelve `secureUrl`. |
| `GET` | `/files/product/:imageName` | Sirve una imagen almacenada en `static/products`. |

Se aceptan imagenes `jpg`, `jpeg`, `png` y `gif`. Las imagenes se guardan con un nombre UUID. La URL devuelta por la subida puede utilizarse despues en el campo `images` de un producto.

Para subir una imagen, el nombre del campo multipart debe ser exactamente `file`:

```bash
curl -X POST http://localhost:3000/api/files/product \
  -F "file=@./foto-producto.jpg"
```

Respuesta esperada:

```json
{
  "secureUrl": "http://localhost:3000/api/files/product/uuid-generado.jpg"
}
```

Para consultar la imagen se usa el nombre generado en `secureUrl`:

```bash
curl http://localhost:3000/api/files/product/uuid-generado.jpg --output foto-descargada.jpg
```

### Seed

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| `GET` | `/seed` | Borra usuarios y productos, y vuelve a insertar los datos definidos en `src/seed/data/seed-data.ts`. |

El seed es destructivo y actualmente no requiere autenticacion. Ejecutarlo solo en entornos de desarrollo o cuando se quiera reinicializar la base de datos.

```bash
curl http://localhost:3000/api/seed
```

La respuesta normal es `SEED EXECUTED`. El seed crea usuarios de prueba y productos definidos en `src/seed/data/seed-data.ts`; entre las credenciales iniciales se encuentra `test1@google.com` con contrasena `Abc1234` y rol `admin`.

## WebSocket

El gateway Socket.IO se conecta en la misma aplicacion y permite mensajeria en tiempo real.

- Conexion: `http://localhost:3000`.
- En el handshake enviar el JWT en el header `authorization`.
- Un usuario activo solo puede mantener una conexion; una nueva desconecta la anterior.
- Evento de entrada: `message-from-client`.
- Payload: `{ "message": "Hola" }`.
- Evento de salida para todos los clientes: `message-from-server`.
- Evento de presencia: `clients-updated`.

Ejemplo con JavaScript:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  extraHeaders: { authorization: token }
});

socket.emit('message-from-client', { message: 'Hola equipo' });
socket.on('message-from-server', console.log);
socket.on('clients-updated', console.log);
```

## Estructura principal

```text
src/
├── auth/          Registro, login, JWT, roles y guards
├── products/      CRUD de productos y entidades TypeORM
├── files/         Subida y servicio de imagenes
├── message-ws/    Gateway y servicio Socket.IO
├── seed/          Datos iniciales y endpoint de reinicio
├── common/        DTOs compartidos, incluida la paginacion
├── app.module.ts  Configuracion de modulos y PostgreSQL
└── main.ts        Prefijo /api, validacion y Swagger
static/products/   Imagenes de productos
```

## Scripts

| Comando | Uso |
| --- | --- |
| `pnpm start:dev` | Desarrollo con recarga automatica. |
| `pnpm build` | Compila en `dist`. |
| `pnpm start:prod` | Ejecuta la compilacion producida. |
| `pnpm lint` | Ejecuta ESLint y aplica correcciones. |
| `pnpm format` | Formatea los archivos TypeScript. |
| `pnpm test` | Ejecuta las pruebas Jest. |
| `pnpm test:e2e` | Ejecuta las pruebas end-to-end. |
| `pnpm test:cov` | Ejecuta Jest con cobertura. |

## Base de datos y advertencias

- PostgreSQL se persiste en la carpeta local `postgres/`, montada por Docker Compose.
- TypeORM esta configurado con `synchronize: true`; no se recomienda esa opcion para produccion con datos importantes.
- Las contrasenas se almacenan con bcrypt y no se devuelven durante el registro.
- La validacion global rechaza propiedades no declaradas (`whitelist` y `forbidNonWhitelisted`).
- El test e2e incluido conserva la expectativa de una ruta raiz `/` con `Hello World!`; esa ruta no esta expuesta por el controlador actual, por lo que debe actualizarse antes de usarlo como verificacion de salud.