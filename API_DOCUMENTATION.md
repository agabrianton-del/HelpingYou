# 📚 Documentación de API - HelpingYou

<div align="center">

**Referencia completa de todos los endpoints de la API REST de HelpingYou**

![API](https://img.shields.io/badge/API-RESTful-blue)
![Version](https://img.shields.io/badge/Version-v1-green)
![Authentication](https://img.shields.io/badge/Auth-JWT-orange)

</div>

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Autenticación](#autenticación)
- [Base URL y Headers](#base-url-y-headers)
- [Códigos de Estado](#códigos-de-estado)
- [Autenticación (Auth)](#autenticación-auth)
- [Usuarios (Users)](#usuarios-users)
- [Conversaciones (Conversations)](#conversaciones-conversations)
- [Mensajes (Messages)](#mensajes-messages)
- [Videollamadas (Calls)](#videollamadas-calls)
- [Streaming](#streaming)
- [Notificaciones (Notifications)](#notificaciones-notifications)
- [Moderación (Moderation)](#moderación-moderation)
- [WebSocket (Real-time)](#websocket-real-time)
- [Rate Limiting](#rate-limiting)
- [Ejemplos de Cliente](#ejemplos-de-cliente)

---

## Introducción

La API de HelpingYou proporciona acceso a todos los recursos de la plataforma. Esta documentación describe los endpoints disponibles, parámetros, respuestas y ejemplos.

**Características:**
- ✅ API RESTful con JSON
- ✅ Autenticación JWT
- ✅ WebSocket para tiempo real
- ✅ Rate limiting inteligente
- ✅ Versionado (v1, v2, etc.)
- ✅ CORS habilitado

---

## Autenticación

### Métodos Soportados

1. **JWT (Token)** - Para requests autenticados
2. **OAuth2** (Opcional) - Para integraciones
3. **API Key** - Para aplicaciones servidor

### Obtener Token

```bash
curl -X POST https://api.helpingyou.org/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your_password"
  }'
```

**Respuesta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user"
  }
}
```

### Usar Token en Requests

```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  https://api.helpingyou.org/api/v1/users/me
```

---

## Base URL y Headers

### Base URL

```
Producción:  https://api.helpingyou.org
Staging:     https://staging-api.helpingyou.org
Desarrollo:  http://localhost:3000
```

### Headers Requeridos

```bash
# Para todas las requests
Content-Type: application/json
Accept: application/json

# Para requests autenticadas
Authorization: Bearer <token>

# Opcional pero recomendado
X-Request-ID: <uuid>        # Para tracking
X-Client-Version: 1.0.0     # Versión del cliente
```

### Ejemplo de Header Completo

```bash
curl -X GET https://api.helpingyou.org/api/v1/users/me \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "X-Request-ID: 550e8400-e29b-41d4-a716-446655440000"
```

---

## Códigos de Estado

| Código | Significado | Descripción |
|--------|------------|-------------|
| **200** | OK | Solicitud exitosa |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Solicitud exitosa sin contenido |
| **400** | Bad Request | Parámetros inválidos |
| **401** | Unauthorized | Token inválido o expirado |
| **403** | Forbidden | No tienes permisos |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | El recurso ya existe |
| **429** | Too Many Requests | Rate limit excedido |
| **500** | Server Error | Error interno del servidor |
| **503** | Service Unavailable | Servicio no disponible |

### Formato de Error

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "El email es inválido",
  "timestamp": "2026-07-17T16:30:00Z",
  "path": "/api/v1/auth/register",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Autenticación (Auth)

### 1. Registrar Usuario

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123!",
  "displayName": "John Doe"
}
```

**Respuesta 201:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "newuser@example.com",
  "displayName": "John Doe",
  "role": "user",
  "isVerified": false,
  "createdAt": "2026-07-17T16:30:00Z"
}
```

**Validaciones:**
- Email válido y único
- Contraseña mínimo 8 caracteres, mayúscula, número, símbolo
- Display name no vacío

---

### 2. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": false
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "role": "user",
    "isVerified": true
  }
}
```

---

### 3. Refresh Token

```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Respuesta 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

---

### 4. Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

**Respuesta 204:** (No Content)

---

### 5. Verificar Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "token": "verification_token_from_email"
}
```

**Respuesta 200:**
```json
{
  "message": "Email verificado exitosamente",
  "isVerified": true
}
```

---

### 6. Recuperar Contraseña

```http
POST /api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Respuesta 200:**
```json
{
  "message": "Se envió un enlace de recuperación a tu email"
}
```

---

### 7. Resetear Contraseña

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_from_email",
  "newPassword": "NewSecurePassword123!"
}
```

**Respuesta 200:**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

## Usuarios (Users)

### 1. Obtener Perfil Actual

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "displayName": "John Doe",
  "role": "user",
  "profile": {
    "bio": "Soy un voluntario",
    "avatar": "https://cdn.helpingyou.org/avatars/user-123.jpg",
    "languages": ["es", "en"],
    "country": "Spain",
    "isVerified": true,
    "reputation": 95
  },
  "createdAt": "2026-07-17T16:30:00Z",
  "lastLogin": "2026-07-17T16:45:00Z"
}
```

---

### 2. Obtener Usuario por ID

```http
GET /api/v1/users/:id
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "John Doe",
  "profile": {
    "bio": "Soy un voluntario",
    "avatar": "https://cdn.helpingyou.org/avatars/user-123.jpg",
    "languages": ["es", "en"],
    "country": "Spain",
    "reputation": 95
  }
}
```

**Nota:** Los datos públicos solo muestran información no sensible.

---

### 3. Actualizar Perfil

```http
PUT /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "displayName": "John Smith",
  "profile": {
    "bio": "Voluntario de HelpingYou",
    "languages": ["es", "en", "fr"],
    "country": "Spain"
  }
}
```

**Respuesta 200:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "displayName": "John Smith",
  "profile": {
    "bio": "Voluntario de HelpingYou",
    "languages": ["es", "en", "fr"],
    "country": "Spain"
  },
  "updatedAt": "2026-07-17T16:50:00Z"
}
```

---

### 4. Cambiar Contraseña

```http
PUT /api/v1/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Respuesta 200:**
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

---

### 5. Eliminar Cuenta

```http
DELETE /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "YourPassword123!"
}
```

**Respuesta 204:** (No Content)

**Nota:** Soft delete, los datos se conservan 30 días.

---

### 6. Listar Usuarios

```http
GET /api/v1/users?page=1&limit=20&role=volunteer&country=Spain
Authorization: Bearer <token>
```

**Parámetros:**
- `page` (número) - Página (default: 1)
- `limit` (número) - Resultados por página (default: 20, máximo: 100)
- `role` (string) - Filtrar por rol: user, volunteer, moderator
- `country` (string) - Filtrar por país
- `search` (string) - Buscar por nombre

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "displayName": "John Doe",
      "profile": {
        "country": "Spain",
        "languages": ["es", "en"],
        "reputation": 95
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## Conversaciones (Conversations)

### 1. Crear Conversación

```http
POST /api/v1/conversations
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "direct",
  "participantId": "550e8400-e29b-41d4-a716-446655440001",
  "subject": "Necesito ayuda"
}
```

**Tipos de conversación:**
- `direct` - Conversación 1 a 1
- `group` - Conversación de grupo
- `support` - Soporte técnico

**Respuesta 201:**
```json
{
  "id": "conv-550e8400-e29b-41d4-a716-446655440000",
  "type": "direct",
  "participants": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "subject": "Necesito ayuda",
  "createdAt": "2026-07-17T16:30:00Z",
  "lastMessage": null,
  "unreadCount": 0
}
```

---

### 2. Listar Conversaciones

```http
GET /api/v1/conversations?page=1&limit=20&status=active
Authorization: Bearer <token>
```

**Parámetros:**
- `page` (número)
- `limit` (número)
- `status` (string) - active, archived, closed

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "conv-550e8400-e29b-41d4-a716-446655440000",
      "type": "direct",
      "participants": 2,
      "subject": "Necesito ayuda",
      "lastMessage": {
        "id": "msg-123",
        "content": "¿Cómo puedo ayudarte?",
        "sender": "550e8400-e29b-41d4-a716-446655440001",
        "createdAt": "2026-07-17T16:45:00Z"
      },
      "unreadCount": 3,
      "updatedAt": "2026-07-17T16:45:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### 3. Obtener Conversación

```http
GET /api/v1/conversations/:id
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "conv-550e8400-e29b-41d4-a716-446655440000",
  "type": "direct",
  "subject": "Necesito ayuda",
  "participants": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "displayName": "John Doe",
      "avatar": "https://cdn.helpingyou.org/avatars/user-123.jpg"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "displayName": "Jane Smith",
      "avatar": "https://cdn.helpingyou.org/avatars/user-456.jpg"
    }
  ],
  "createdAt": "2026-07-17T16:30:00Z",
  "updatedAt": "2026-07-17T16:45:00Z"
}
```

---

### 4. Actualizar Conversación

```http
PUT /api/v1/conversations/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "subject": "Nuevo asunto",
  "status": "active"
}
```

**Respuesta 200:**
```json
{
  "id": "conv-550e8400-e29b-41d4-a716-446655440000",
  "subject": "Nuevo asunto",
  "status": "active",
  "updatedAt": "2026-07-17T16:50:00Z"
}
```

---

### 5. Cerrar Conversación

```http
DELETE /api/v1/conversations/:id
Authorization: Bearer <token>
```

**Respuesta 204:** (No Content)

---

## Mensajes (Messages)

### 1. Enviar Mensaje

```http
POST /api/v1/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hola, ¿cómo estás?",
  "type": "text"
}
```

**Tipos de mensaje:**
- `text` - Texto plano
- `image` - Imagen
- `file` - Archivo
- `audio` - Audio
- `video` - Video

**Respuesta 201:**
```json
{
  "id": "msg-550e8400-e29b-41d4-a716-446655440000",
  "conversationId": "conv-123",
  "sender": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hola, ¿cómo estás?",
  "type": "text",
  "createdAt": "2026-07-17T16:30:00Z",
  "isRead": false,
  "reactions": []
}
```

---

### 2. Enviar Mensaje con Archivo

```http
POST /api/v1/conversations/:conversationId/messages
Authorization: Bearer <token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="content"
Documento importante
--boundary
Content-Disposition: form-data; name="file"; filename="document.pdf"
Content-Type: application/pdf
[binary file data]
--boundary
```

**Respuesta 201:**
```json
{
  "id": "msg-550e8400-e29b-41d4-a716-446655440000",
  "conversationId": "conv-123",
  "sender": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Documento importante",
  "type": "file",
  "attachment": {
    "url": "https://cdn.helpingyou.org/files/doc-123.pdf",
    "fileName": "document.pdf",
    "mimeType": "application/pdf",
    "size": 1024000
  },
  "createdAt": "2026-07-17T16:30:00Z"
}
```

---

### 3. Listar Mensajes

```http
GET /api/v1/conversations/:conversationId/messages?page=1&limit=50
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "msg-123",
      "sender": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "displayName": "John Doe"
      },
      "content": "Hola, ¿cómo estás?",
      "type": "text",
      "createdAt": "2026-07-17T16:30:00Z",
      "isRead": true,
      "reactions": [
        {
          "emoji": "👍",
          "count": 2
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 250,
    "pages": 5
  }
}
```

---

### 4. Editar Mensaje

```http
PUT /api/v1/conversations/:conversationId/messages/:messageId
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Hola, ¿cómo estás? (editado)"
}
```

**Respuesta 200:**
```json
{
  "id": "msg-123",
  "content": "Hola, ¿cómo estás? (editado)",
  "isEdited": true,
  "editedAt": "2026-07-17T16:35:00Z"
}
```

---

### 5. Eliminar Mensaje

```http
DELETE /api/v1/conversations/:conversationId/messages/:messageId
Authorization: Bearer <token>
```

**Respuesta 204:** (No Content)

---

### 6. Marcar Mensaje como Leído

```http
PUT /api/v1/conversations/:conversationId/messages/:messageId/read
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "msg-123",
  "isRead": true
}
```

---

### 7. Reaccionar a Mensaje

```http
POST /api/v1/conversations/:conversationId/messages/:messageId/reactions
Authorization: Bearer <token>
Content-Type: application/json

{
  "emoji": "👍"
}
```

**Respuesta 201:**
```json
{
  "messageId": "msg-123",
  "emoji": "👍",
  "count": 3,
  "userReacted": true
}
```

---

## Videollamadas (Calls)

### 1. Iniciar Videollamada

```http
POST /api/v1/calls/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "recipientId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "video"
}
```

**Tipos de llamada:**
- `audio` - Solo audio
- `video` - Audio + video
- `screen-share` - Compartir pantalla

**Respuesta 201:**
```json
{
  "id": "call-550e8400-e29b-41d4-a716-446655440000",
  "initiator": "550e8400-e29b-41d4-a716-446655440000",
  "recipient": "550e8400-e29b-41d4-a716-446655440001",
  "type": "video",
  "status": "ringing",
  "signalingToken": "signaling-token-xxxxx",
  "turnServers": [
    {
      "urls": ["turn:turn.helpingyou.org:3478"],
      "username": "user123",
      "credential": "password123"
    }
  ],
  "createdAt": "2026-07-17T16:30:00Z"
}
```

---

### 2. Aceptar Llamada

```http
POST /api/v1/calls/:callId/accept
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "call-550e8400-e29b-41d4-a716-446655440000",
  "status": "connected",
  "startedAt": "2026-07-17T16:30:30Z"
}
```

---

### 3. Rechazar Llamada

```http
POST /api/v1/calls/:callId/reject
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "call-550e8400-e29b-41d4-a716-446655440000",
  "status": "rejected",
  "endedAt": "2026-07-17T16:30:45Z"
}
```

---

### 4. Finalizar Llamada

```http
POST /api/v1/calls/:callId/end
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 300
}
```

**Respuesta 200:**
```json
{
  "id": "call-550e8400-e29b-41d4-a716-446655440000",
  "status": "ended",
  "duration": 300,
  "endedAt": "2026-07-17T16:35:00Z"
}
```

---

## Streaming

### 1. Crear Evento de Streaming

```http
POST /api/v1/streams
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Charla sobre salud mental",
  "description": "Una conversación abierta",
  "scheduledFor": "2026-07-20T18:00:00Z",
  "maxViewers": 1000
}
```

**Respuesta 201:**
```json
{
  "id": "stream-550e8400-e29b-41d4-a716-446655440000",
  "title": "Charla sobre salud mental",
  "broadcaster": "550e8400-e29b-41d4-a716-446655440000",
  "status": "scheduled",
  "streamUrl": "rtmp://stream.helpingyou.org/live/stream-123",
  "streamKey": "stream-key-xxxxx",
  "scheduledFor": "2026-07-20T18:00:00Z",
  "createdAt": "2026-07-17T16:30:00Z"
}
```

---

### 2. Iniciar Streaming

```http
POST /api/v1/streams/:streamId/start
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "stream-550e8400-e29b-41d4-a716-446655440000",
  "status": "live",
  "viewerCount": 0,
  "startedAt": "2026-07-17T16:30:00Z",
  "watchUrl": "https://watch.helpingyou.org/stream-123"
}
```

---

### 3. Terminar Streaming

```http
POST /api/v1/streams/:streamId/end
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "stream-550e8400-e29b-41d4-a716-446655440000",
  "status": "ended",
  "totalViewers": 250,
  "recordingUrl": "https://cdn.helpingyou.org/recordings/stream-123.mp4",
  "duration": 3600,
  "endedAt": "2026-07-17T17:30:00Z"
}
```

---

## Notificaciones (Notifications)

### 1. Listar Notificaciones

```http
GET /api/v1/notifications?page=1&limit=20&unreadOnly=true
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "notif-550e8400-e29b-41d4-a716-446655440000",
      "type": "message_received",
      "title": "Nuevo mensaje",
      "message": "John Doe te envió un mensaje",
      "data": {
        "conversationId": "conv-123",
        "messageId": "msg-456"
      },
      "isRead": false,
      "createdAt": "2026-07-17T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "unreadCount": 5
  }
}
```

---

### 2. Marcar Notificación como Leída

```http
PUT /api/v1/notifications/:notificationId/read
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "id": "notif-550e8400-e29b-41d4-a716-446655440000",
  "isRead": true
}
```

---

### 3. Marcar Todas como Leídas

```http
PUT /api/v1/notifications/read-all
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "message": "Todas las notificaciones marcadas como leídas",
  "count": 5
}
```

---

### 4. Cambiar Preferencias de Notificaciones

```http
PUT /api/v1/users/me/notification-preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": {
    "newMessage": true,
    "newCall": true,
    "weeklyDigest": false
  },
  "push": {
    "newMessage": true,
    "newCall": true
  }
}
```

**Respuesta 200:**
```json
{
  "email": {
    "newMessage": true,
    "newCall": true,
    "weeklyDigest": false
  },
  "push": {
    "newMessage": true,
    "newCall": true
  }
}
```

---

## Moderación (Moderation)

### 1. Reportar Usuario

```http
POST /api/v1/reports
Authorization: Bearer <token>
Content-Type: application/json

{
  "reportedUserId": "550e8400-e29b-41d4-a716-446655440001",
  "reason": "harassment",
  "description": "El usuario está enviando mensajes ofensivos"
}
```

**Motivos válidos:**
- `harassment` - Acoso
- `inappropriate_content` - Contenido inapropiado
- `spam` - Spam
- `violence` - Violencia
- `other` - Otro

**Respuesta 201:**
```json
{
  "id": "report-550e8400-e29b-41d4-a716-446655440000",
  "reportedUserId": "550e8400-e29b-41d4-a716-446655440001",
  "reason": "harassment",
  "status": "open",
  "createdAt": "2026-07-17T16:30:00Z"
}
```

---

### 2. Bloquear Usuario

```http
POST /api/v1/users/me/blocked/:blockedUserId
Authorization: Bearer <token>
```

**Respuesta 201:**
```json
{
  "message": "Usuario bloqueado",
  "blockedUserId": "550e8400-e29b-41d4-a716-446655440001"
}
```

---

### 3. Desbloquear Usuario

```http
DELETE /api/v1/users/me/blocked/:blockedUserId
Authorization: Bearer <token>
```

**Respuesta 204:** (No Content)

---

### 4. Listar Usuarios Bloqueados

```http
GET /api/v1/users/me/blocked?page=1&limit=20
Authorization: Bearer <token>
```

**Respuesta 200:**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "displayName": "Blocked User",
      "blockedAt": "2026-07-17T16:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "pages": 1
  }
}
```

---

## WebSocket (Real-time)

### Conectar a WebSocket

```javascript
const token = "your_jwt_token";
const ws = new WebSocket(`wss://api.helpingyou.org/ws?token=${token}`);

ws.onopen = () => {
  console.log("Conectado");
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Mensaje recibido:", data);
};

ws.onerror = (error) => {
  console.error("Error:", error);
};
```

---

### Eventos WebSocket

#### 1. Nuevo Mensaje

```json
{
  "type": "message:received",
  "data": {
    "id": "msg-123",
    "conversationId": "conv-456",
    "sender": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "displayName": "John Doe"
    },
    "content": "Hola",
    "createdAt": "2026-07-17T16:30:00Z"
  }
}
```

---

#### 2. Estado de Escritura

```json
{
  "type": "user:typing",
  "data": {
    "conversationId": "conv-456",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "John Doe",
    "isTyping": true
  }
}
```

---

#### 3. Llamada Entrante

```json
{
  "type": "call:incoming",
  "data": {
    "id": "call-123",
    "initiator": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "displayName": "John Doe"
    },
    "type": "video",
    "signalingToken": "signaling-token-xxxxx"
  }
}
```

---

#### 4. Usuario en Línea

```json
{
  "type": "user:online",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "displayName": "John Doe",
    "status": "online"
  }
}
```

---

#### 5. Usuario Fuera de Línea

```json
{
  "type": "user:offline",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "lastSeen": "2026-07-17T16:45:00Z"
  }
}
```

---

### Enviar Mensajes por WebSocket

```javascript
// Indicar que estoy escribiendo
ws.send(JSON.stringify({
  type: "user:typing",
  conversationId: "conv-456",
  isTyping: true
}));

// Dejar de escribir
ws.send(JSON.stringify({
  type: "user:typing",
  conversationId: "conv-456",
  isTyping: false
}));
```

---

## Rate Limiting

### Límites Aplicados

```
- Login: 5 intentos / 15 minutos
- Crear mensaje: 50 / minuto
- Crear conversación: 10 / minuto
- Upload archivo: 100 MB / día
- API general: 1000 requests / hora
```

### Headers de Rate Limit

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1689610200
```

### Respuesta cuando se excede

```
HTTP/1.1 429 Too Many Requests

{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Has excedido el límite de requests",
  "retryAfter": 60
}
```

---

## Ejemplos de Cliente

### JavaScript/Node.js

```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'https://api.helpingyou.org/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
client.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Login
async function login(email, password) {
  const response = await client.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', response.data.accessToken);
  return response.data;
}

// Obtener mensajes
async function getMessages(conversationId) {
  const response = await client.get(`/conversations/${conversationId}/messages`);
  return response.data;
}

// Enviar mensaje
async function sendMessage(conversationId, content) {
  const response = await client.post(
    `/conversations/${conversationId}/messages`,
    { content, type: 'text' }
  );
  return response.data;
}
```

---

### Python

```python
import requests

BASE_URL = 'https://api.helpingyou.org/api/v1'

class HelpingYouClient:
    def __init__(self):
        self.token = None
        self.session = requests.Session()
    
    def login(self, email, password):
        response = self.session.post(
            f'{BASE_URL}/auth/login',
            json={'email': email, 'password': password}
        )
        self.token = response.json()['accessToken']
        self.session.headers.update({'Authorization': f'Bearer {self.token}'})
        return response.json()
    
    def get_messages(self, conversation_id):
        response = self.session.get(
            f'{BASE_URL}/conversations/{conversation_id}/messages'
        )
        return response.json()
    
    def send_message(self, conversation_id, content):
        response = self.session.post(
            f'{BASE_URL}/conversations/{conversation_id}/messages',
            json={'content': content, 'type': 'text'}
        )
        return response.json()

# Uso
client = HelpingYouClient()
client.login('user@example.com', 'password')
messages = client.get_messages('conv-123')
```

---

### cURL

```bash
# Login
curl -X POST https://api.helpingyou.org/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'

# Guardar token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Obtener perfil
curl -X GET https://api.helpingyou.org/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"

# Enviar mensaje
curl -X POST https://api.helpingyou.org/api/v1/conversations/conv-123/messages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Hola", "type": "text"}'
```

---

## Soporte

¿Necesitas ayuda con la API?

- 📧 **Email:** api-support@helpingyou.org
- 💬 **Discussions:** https://github.com/agabrianton-del/HelpingYou/discussions
- 🐛 **Issues:** https://github.com/agabrianton-del/HelpingYou/issues
- 📚 **Documentación:** https://docs.helpingyou.org

---

**Última actualización:** 2026-07-17

**Versión de API:** v1

💙 *Build amazing integrations with HelpingYou*
