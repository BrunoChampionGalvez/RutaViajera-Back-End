## RutaViajera – Back-End (API NestJS)

Plataforma de reservas hoteleras: permite a usuarios buscar y reservar habitaciones, a administradores de hotel publicar y gestionar hoteles y a un superadmin administrar el ecosistema desde un dashboard.

Frontend desplegado: https://ruta-viajera-front-end.vercel.app/
Repositorio del proyecto (Back-End): https://github.com/BrunoChampionGalvez/RutaViajera-Back-End

### Tech stack

- NestJS (Node.js, TypeScript)
- PostgreSQL (TypeORM)
- Autenticación con Google OAuth 2.0 y JWT
- Nodemailer para notificaciones por correo

### Estructura (resumen)

- Módulos principales: auth, hotels, rooms, roomstype, bookings, bookingDetails, availabilities, reviews, customers, hotel-admins, super-admin, email-notify.
- Swagger disponible en /api para explorar los endpoints.

## Requisitos

- Node.js 18+ y npm
- PostgreSQL 13+

## Configuración rápida

1) Crea un archivo .env a partir de .env.example y rellena los valores.
2) Asegúrate de tener una base de datos PostgreSQL creada y accesible.

Variables de entorno necesarias (placeholders):

- DB_NAME, DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD: conexión a PostgreSQL.
- PORT: puerto del API (por defecto 3001 en este proyecto).
- API_URL: URL pública/base del backend, usada para callbacks de OAuth (ej. http://localhost:3001).
- ALLOWED_ORIGINS: lista separada por coma para CORS (ej. http://localhost:3000,https://ruta-viajera-front-end.vercel.app).
- JWT_SECRET: clave para firmar JWT.
- SESSION_SECRET: clave para sesiones (Passport).
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET: credenciales de OAuth de Google.
- MAIL, PASS: credenciales de correo (recomendado Gmail con App Password de 16 caracteres).

Ejemplo mínimo de .env:

```
DB_NAME=rutaviajera
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres

PORT=3001
API_URL=http://localhost:3001
ALLOWED_ORIGINS=http://localhost:3000,https://ruta-viajera-front-end.vercel.app

JWT_SECRET=mi-jwt-secreto
SESSION_SECRET=mi-session-secreto

GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

MAIL=tu_correo@gmail.com
PASS=tu_app_password_de_16_caracteres
```

## Ejecutar en local

1) Instalar dependencias

```powershell
npm install
```

2) Levantar el servidor (modo desarrollo)

```powershell
npm run start:dev
```

3) API en marcha en http://localhost:3001 y documentación en http://localhost:3001/api

Notas:
- Asegúrate de que la variable ALLOWED_ORIGINS incluya el origen del front (por ejemplo http://localhost:3000) para evitar errores CORS.
- Se sirve la carpeta /uploads de forma estática en /uploads.

## Scripts útiles

- Desarrollo: npm run start:dev
- Producción: npm run build && npm run start:prod

## Licencia

MIT
