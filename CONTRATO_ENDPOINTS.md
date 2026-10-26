# 📄 Contrato de API - Backend Catálogo 3D (Pizzo Velocity)

Servidor Base: `http://localhost:3001` (o `http://10.0.2.2:3001` en Emulador Android)  
Documentación Interactiva Swagger: `http://localhost:3001/api/docs`

---

## 1. 👟 Módulo Zapatillas (`/zapatillas`)

### **GET `/zapatillas`**
Obtiene el catálogo de zapatillas filtrado y ordenado.

#### **Query Parameters:**
| Parámetro | Tipo | Requerido | Descripción / Valores válidos | Ejemplo |
| :--- | :--- | :--- | :--- | :--- |
| `q` | `string` | No | Búsqueda por texto (nombre, marca o modelo) | `Runner` |
| `marca` | `string` | No | Filtro por marca | `Pizzo`, `Nike`, `Adidas` |
| `talla` | `number` | No | Filtro por talla disponible | `42` |
| `precioMin` | `number` | No | Precio mínimo | `100` |
| `precioMax` | `number` | No | Precio máximo | `500` |
| `orden` | `string` | No | Criterio de ordenación: `precio_asc`, `precio_desc`, `nuevo`, `nombre` | `precio_asc` |
| `soloConStock` | `boolean` | No | Si es `true`, retorna solo zapatillas con stock > 0 | `true` |

#### **Respuesta (`200 OK`):**
```json
[
  {
    "id": "zap-001",
    "nombre": "Pizzo Velocity 3D Pro",
    "marca": "Pizzo",
    "modelo": "Velocity 2026",
    "precio": 289.90,
    "precioAnterior": 349.90,
    "descripcion": "Zapatilla de alto rendimiento para atletismo con soporte de amortiguación responsiva y modelo 3D GLB.",
    "imagenes": [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    ],
    "modelo3dUrl": "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/MaterialsVariantsShoe/glTF-Binary/MaterialsVariantsShoe.glb",
    "tallasDisponibles": [38, 39, 40, 41, 42, 43],
    "colores": ["Negro/Rojo", "Blanco/Verde"],
    "stock": 15,
    "esNuevo": true,
    "categoria": "Deportivas"
  }
]
```

### **GET `/zapatillas/:id`**
Obtiene una zapatilla por su identificador único.

#### **Respuesta (`200 OK`):**
Objeto JSON de Zapatilla individual.

---

## 2. 🛒 Módulo Pedidos (`/pedidos`)

### **POST `/pedidos`**
Crea un nuevo pedido a partir del carrito de compras.

#### **Headers:**
* `Authorization`: `Bearer <token>` (opcional en desarrollo/mock)

#### **Request Body JSON:**
```json
{
  "items": [
    {
      "zapatillaId": "zap-001",
      "cantidad": 2,
      "talla": 42,
      "precioUnitario": 289.90
    }
  ],
  "direccionEnvio": {
    "calle": "Av. España 123",
    "ciudad": "Trujillo",
    "region": "La Libertad",
    "codigoPostal": "13001",
    "telefono": "987654321"
  },
  "metodoPago": "mercado_pago",
  "notas": "Entregar en la tarde"
}
```

#### **Respuesta (`201 Created`):**
```json
{
  "id": "ped-1729000000000",
  "usuarioId": "user-123",
  "items": [
    {
      "zapatillaId": "zap-001",
      "nombre": "Pizzo Velocity 3D Pro",
      "cantidad": 2,
      "talla": 42,
      "precioUnitario": 289.90,
      "subtotal": 579.80
    }
  ],
  "montoEnvio": 15.00,
  "montoSubtotal": 579.80,
  "montoTotal": 594.80,
  "estado": "pendiente_pago",
  "metodoPago": "mercado_pago",
  "direccionEnvio": {
    "calle": "Av. España 123",
    "ciudad": "Trujillo",
    "region": "La Libertad",
    "codigoPostal": "13001",
    "telefono": "987654321"
  },
  "fechaCreacion": "2026-10-24T16:00:00.000Z"
}
```

### **GET `/pedidos/mis`**
Obtiene el historial de pedidos del usuario autenticado.

#### **Respuesta (`200 OK`):**
Arreglo `[ PedidoResponseDto ]`.

---

## 3. 💳 Módulo Pagos / Pasarela Sandbox (`/pagos`)

### **POST `/pagos/crear-preferencia`**
Genera el checkout o preferencia de pago en la pasarela (Mercado Pago / Sandbox).

#### **Request Body JSON:**
```json
{
  "pedidoId": "ped-1729000000000",
  "metodoPago": "mercado_pago",
  "redirectUrl": "pizzoapp://checkout/success"
}
```

#### **Respuesta (`200 OK`):**
```json
{
  "preferenciaId": "PREF-SANDBOX-987654321",
  "pedidoId": "ped-1729000000000",
  "initPoint": "https://www.mercadopago.com.pe/checkout/v1/redirect?pref_id=PREF-SANDBOX-987654321",
  "sandboxInitPoint": "https://sandbox.mercadopago.com.pe/checkout/v1/redirect?pref_id=PREF-SANDBOX-987654321",
  "montoTotal": 594.80,
  "estado": "creado"
}
```

### **POST `/pagos/webhook`**
Receptor de notificaciones automáticas de la pasarela de pagos.

#### **Request Body JSON (Simulado Mercado Pago Notification):**
```json
{
  "action": "payment.created",
  "type": "payment",
  "data": {
    "id": "12345678"
  },
  "external_reference": "ped-1729000000000",
  "status": "approved"
}
```

#### **Respuesta (`200 OK`):**
```json
{
  "recibido": true,
  "pedidoId": "ped-1729000000000",
  "nuevoEstadoPedido": "pagado",
  "mensaje": "Estado del pedido actualizado correctamente"
}
```

### **POST `/pagos/confirmar-simulado`**
Permite confirmar un pago manualmente en entorno sandbox para pruebas locales de desarrollo.

#### **Request Body JSON:**
```json
{
  "pedidoId": "ped-1729000000000",
  "estado": "approved"
}
```

#### **Respuesta (`200 OK`):**
```json
{
  "exito": true,
  "pedidoId": "ped-1729000000000",
  "estado": "pagado"
}
```
