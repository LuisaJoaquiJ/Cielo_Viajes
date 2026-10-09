# ✈️ Cielo Viajes — Plataforma web para agencia de viajes

Aplicación web full-stack para una agencia de viajes: los clientes exploran destinos y paquetes, reservan y pagan en línea, y el equipo interno (agentes y administradores) gestiona viajes, reservas, reembolsos y solicitudes de contacto desde paneles propios.

> 🔗 **Demo:** _agrega aquí el enlace de Vercel_

## Funcionalidades

**Sitio público**
- Página de inicio con globo terráqueo animado, carruseles y viajes destacados
- Catálogo de viajes con búsqueda y filtros (destino, fechas, precio)
- Detalle de destinos y paquetes con itinerario
- Formulario de contacto (leads) y botón de WhatsApp
- Asistente virtual con IA (Google Gemini) que responde en español
- Páginas legales: términos, privacidad y política de reembolsos

**Clientes**
- Registro e inicio de sesión con JWT
- Reserva de viajes con datos de pasajeros (adulto, niño, infante)
- Checkout y seguimiento de reservas en "Mi cuenta"

**Agentes**
- Creación y gestión de reservas para clientes
- Consulta de viajes disponibles

**Administradores**
- Dashboard general
- CRUD de destinos y viajes
- Gestión de reservas, usuarios y roles
- Gestión de leads (solicitudes de contacto)
- Módulo de reembolsos con segmentos, archivos adjuntos e historial de estados

## Tecnologías

| Capa | Tecnologías |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand, React Hook Form + Zod, Axios, GSAP |
| Backend | NestJS 11, TypeScript, Passport + JWT, class-validator, Joi |
| Base de datos | PostgreSQL con Prisma ORM 7 |
| IA | Google Gemini (`@google/genai`) |

## Arquitectura

```
blue/
├── src/                  # API REST en NestJS
│   ├── modules/          # auth, users, destinations, trips, bookings,
│   │                     # payments, refunds, leads
│   ├── common/           # decoradores, guards, filtros, interceptores, pipes
│   └── prisma/           # servicio de conexión a la base de datos
├── prisma/               # schema.prisma, migraciones y datos de prueba (seed)
└── mi-frontend/          # Aplicación Next.js
    ├── app/              # rutas: (public), (auth), (dashboard), admin, agente, api/chat
    ├── components/       # componentes de UI
    ├── lib/api.ts        # cliente HTTP hacia la API
    └── store/            # estado global (autenticación)
```

- Control de acceso por roles: `CLIENT`, `AGENT` y `ADMIN`, con guards globales en la API y middleware en el frontend.
- Respuestas de la API con formato uniforme `{ success, data }` mediante un interceptor global.
- Validación de datos de entrada con DTOs y `ValidationPipe`.

## Cómo ejecutarlo localmente

**Requisitos:** Node.js 20+ y PostgreSQL.

### 1. Backend (API)

```bash
npm install
cp .env.example .env          # configura DATABASE_URL y JWT_SECRET
npx prisma migrate deploy
npx prisma db seed            # datos de prueba
npm run start:dev             # http://localhost:3001/api
```

### 2. Frontend

```bash
cd mi-frontend
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL y GEMINI_API_KEY
npm run dev                         # http://localhost:3000
```

### Variables de entorno

| Variable | Dónde | Descripción |
|---|---|---|
| `DATABASE_URL` | API | Cadena de conexión a PostgreSQL |
| `JWT_SECRET` | API | Clave para firmar los tokens |
| `FRONTEND_URL` | API | URL del frontend (CORS) |
| `NEXT_PUBLIC_API_URL` | Frontend | URL de la API, terminada en `/api` |
| `GEMINI_API_KEY` | Frontend | Clave de Google AI Studio para el chatbot |

## Autora

**Luisa Jhulieth Joaqui Jiménez** — Estudiante de Ingeniería de Software, Universidad Autónoma del Cauca.
