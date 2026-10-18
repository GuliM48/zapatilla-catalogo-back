# 👟 Catálogo de Zapatillas - API Backend (NestJS + Firebase)

Documentación completa de la API REST para el catálogo de zapatillas y autenticación, integrada con **Cloud Firestore** y **Firebase Storage**.

- **URL Base:** `http://localhost:3001`
- **Autenticación:** Bearer Token JWT (enviar en Header `Authorization: Bearer <TOKEN>`)

---

## 👥 Roles del Sistema
- **`cliente`**: Usuario común que puede registrarse, loguearse y consultar el catálogo.
- **`admin`**: Administrador que gestiona zapatillas (crear, editar, desactivar y subir archivos multimedia).

> 💡 **Cuenta de Administrador Inicial:**
> - **Email:** `admin@zapatillas.com`
> - **Password:** `Admin123*`
> - **Rol:** `admin`

---

## 🔐 1. Módulo de Autenticación (`/auth`)

### 1.1 Registrar Cliente
- **Método / Endpoint:** `POST /auth/register`
- **Acceso:** Público (cualquier usuario sin autenticación)
- **Descripción:** Registra un nuevo usuario con rol de `cliente`. La contraseña se almacena encriptada con `bcrypt`.

**Body (JSON):**
```json
{
  "nombre": "Carlos Perez",
  "email": "carlos@gmail.com",
  "password": "Password123*",
  "telefono": "987654321"
}
```

**Respuesta Exitosa (`201 Created`):**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": "abc123xyz...",
    "nombre": "Carlos Perez",
    "email": "carlos@gmail.com",
    "rol": "cliente",
    "telefono": "987654321"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 1.2 Iniciar Sesión (Login)
- **Método / Endpoint:** `POST /auth/login`
- **Acceso:** Público
- **Descripción:** Valida credenciales y genera un Token JWT firmado para realizar peticiones protegidas.

**Body (JSON):**
```json
{
  "email": "admin@zapatillas.com",
  "password": "Admin123*"
}
```

**Respuesta Exitosa (`200 OK`):**
```json
{
  "message": "Inicio de sesión exitoso",
  "user": {
    "id": "docIdEnFirestore",
    "nombre": "Administrador Principal",
    "email": "admin@zapatillas.com",
    "rol": "admin",
    "telefono": "999888777"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 👟 2. Módulo de Zapatillas (`/zapatillas`)

### 2.1 Obtener Catálogo Público
- **Método / Endpoint:** `GET /zapatillas`
- **Acceso:** Público (sin login requerido)
- **Descripción:** Devuelve la lista de zapatillas que están **activas** (`activo: true`). Ideal para la pantalla principal de Flutter.
- **Parámetro Opcional para Admin:** `GET /zapatillas?all=true` (devuelve activas e inactivas).

**Respuesta Exitosa (`200 OK`):**
```json
[
  {
    "id": "60oLPAOBUSxs7XySkGKG",
    "nombre": "Nike Air Jordan 1 Retro",
    "marca": "Nike",
    "precio": 185.0,
    "talla": "42",
    "stock": 10,
    "imagenUrl": "https://storage.googleapis.com/.../imagen.webp",
    "modelo3dUrl": "https://.../shoe.glb",
    "descripcion": "Zapatilla clásica de baloncesto",
    "activo": true,
    "createdAt": "2026-10-18T20:14:00.000Z",
    "updatedAt": "2026-10-18T20:14:00.000Z"
  }
]
```

---

### 2.2 Obtener Detalle de una Zapatilla
- **Método / Endpoint:** `GET /zapatillas/:id`
- **Acceso:** Público
- **Descripción:** Devuelve los datos de una zapatilla específica mediante su ID.

**Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "60oLPAOBUSxs7XySkGKG",
  "nombre": "Nike Air Jordan 1 Retro",
  "marca": "Nike",
  "precio": 185.0,
  "talla": "42",
  "stock": 10,
  "imagenUrl": "https://storage.googleapis.com/.../imagen.webp",
  "modelo3dUrl": "https://.../shoe.glb",
  "descripcion": "Zapatilla clásica de baloncesto",
  "activo": true,
  "createdAt": "2026-10-18T20:14:00.000Z",
  "updatedAt": "2026-10-18T20:14:00.000Z"
}
```

---

### 2.3 Subir Archivo Multimedia (Imágenes y Modelos 3D)
- **Método / Endpoint:** `POST /zapatillas/upload`
- **Acceso:** 🔒 **Solo ADMIN** (`Authorization: Bearer <TOKEN_ADMIN>`)
- **Tipo de Contenido:** `multipart/form-data`
- **Descripción:**
  - Recibe el archivo en el campo `file`.
  - **Optimización Automática:** Si es una imagen (PNG, JPG, JPEG), la comprime y convierte automáticamente a formato moderno **`.webp`** con la librería `sharp`.
  - Si es un modelo 3D (`.glb`), se almacena respetando su formato original.
  - Sube el archivo a **Firebase Storage** y devuelve su URL pública.

**Respuesta Exitosa (`201 Created`):**
```json
{
  "url": "https://storage.googleapis.com/banco-de-imagenes-eaffd.firebasestorage.app/zapatillas/9eb996e5-eb00-4d99-bdcf-79de81dc4acb.webp",
  "fileName": "zapatillas/9eb996e5-eb00-4d99-bdcf-79de81dc4acb.webp"
}
```

---

### 2.4 Crear Nueva Zapatilla
- **Método / Endpoint:** `POST /zapatillas`
- **Acceso:** 🔒 **Solo ADMIN**
- **Descripción:** Inserta un nuevo producto en Firestore. Se crea por defecto con `activo: true`.

**Headers:**
```http
Authorization: Bearer <TOKEN_ADMIN>
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "nombre": "Adidas Samba OG",
  "marca": "Adidas",
  "precio": 110.0,
  "talla": "41",
  "stock": 25,
  "imagenUrl": "https://storage.googleapis.com/.../samba.webp",
  "modelo3dUrl": "https://.../samba.glb",
  "descripcion": "Silueta retro ícono del fútbol urbano"
}
```

**Respuesta Exitosa (`201 Created`):**
```json
{
  "id": "4asmUevhhBgMsPsgH3R2",
  "nombre": "Adidas Samba OG",
  "marca": "Adidas",
  "precio": 110.0,
  "talla": "41",
  "stock": 25,
  "imagenUrl": "https://storage.googleapis.com/.../samba.webp",
  "modelo3dUrl": "https://.../samba.glb",
  "descripcion": "Silueta retro ícono del fútbol urbano",
  "activo": true,
  "createdAt": "2026-10-18T20:14:02.000Z",
  "updatedAt": "2026-10-18T20:14:02.000Z"
}
```

---

### 2.5 Actualizar Zapatilla
- **Método / Endpoint:** `PATCH /zapatillas/:id`
- **Acceso:** 🔒 **Solo ADMIN**
- **Descripción:**
  - Modifica uno o más campos (precio, stock, talla, nombre, imagen, etc.).
  - **Limpieza Automática en Storage:** Si se reemplaza la `imagenUrl` o `modelo3dUrl`, el backend elimina de inmediato el archivo anterior en Firebase Storage para ahorrar espacio y no dejar huérfanos.

**Body (JSON) - Campos Opcionales:**
```json
{
  "precio": 99.99,
  "stock": 30
}
```

**Respuesta Exitosa (`200 OK`):**
```json
{
  "id": "4asmUevhhBgMsPsgH3R2",
  "nombre": "Adidas Samba OG",
  "marca": "Adidas",
  "precio": 99.99,
  "talla": "41",
  "stock": 30,
  "activo": true,
  "updatedAt": "2026-10-18T20:14:05.000Z"
}
```

---

### 2.6 Desactivar Zapatilla (Soft Delete)
- **Método / Endpoint:** `DELETE /zapatillas/:id`
- **Acceso:** 🔒 **Solo ADMIN**
- **Descripción:** 
  - Realiza un borrado lógico estableciendo `activo: false`.
  - La zapatilla **desaparece instantáneamente del catálogo público de Flutter**, pero se conserva en Firestore para mantener la integridad de futuras reservas o compras.

**Respuesta Exitosa (`200 OK`):**
```json
{
  "message": "Zapatilla 4asmUevhhBgMsPsgH3R2 desactivada correctamente (no se mostrará en el catálogo)",
  "zapatilla": {
    "id": "4asmUevhhBgMsPsgH3R2",
    "nombre": "Adidas Samba OG",
    "activo": false,
    "updatedAt": "2026-10-18T20:14:08.000Z"
  }
}
```
