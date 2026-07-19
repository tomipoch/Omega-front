# Front-end Relojería y Joyería OMEGA

SPA construida con **React 18**, **Vite**, **React Router**, **TanStack Query** y **Tailwind CSS** que consume un backend Node/Express externo en `http://localhost:4000`.

## Características

- Catálogo, blog y eventos públicos.
- Registro e inicio de sesión con JWT (almacenado en `sessionStorage`).
- Perfil editable con recorte de imagen.
- Solicitudes de personalización, citas y reseñas.
- Panel de administración: usuarios, artículos, citas, disponibilidades, servicios, eventos, productos y reseñas.

## Stack

- React 18 + TypeScript estricto
- Vite 5 (con alias `@/*` → `src/*`)
- React Router 6 con guards por rol (`ProtectedRoute`, `RoleRoute`, `AdminRoute`)
- TanStack Query 5 (provider ya montado en `App.tsx`, listo para migrar páginas)
- Tailwind CSS 3
- Vitest + Testing Library para tests

## Configuración

```bash
cp .env.example .env       # ajusta VITE_API_URL si el backend está en otro host
npm install                # o pnpm install
npm run dev
```

## Variables de entorno

| Variable        | Descripción                              | Por defecto                |
|-----------------|------------------------------------------|----------------------------|
| `VITE_API_URL`  | URL base del backend (sin slash final).  | `http://localhost:4000`    |

Si `VITE_API_URL` no está definida en build de producción, la app lo advertirá por consola y seguirá usando el fallback de localhost (probablemente un error de configuración).

## Scripts

| Comando             | Descripción                                  |
|---------------------|----------------------------------------------|
| `npm run dev`       | Inicia el servidor de desarrollo.            |
| `npm run build`     | Compila a `dist/`.                           |
| `npm run lint`      | Ejecuta ESLint.                              |
| `npm run typecheck` | Ejecuta `tsc --noEmit`.                      |
| `npm run test`      | Ejecuta la suite de Vitest una vez.          |
| `npm run test:watch`| Ejecuta Vitest en modo watch.                |
| `npm run preview`   | Sirve el build de producción.                |

## Estructura

```
src/
├── App.tsx              # Router, providers y layout
├── main.tsx             # Bootstrap React
├── index.css            # Tailwind base
├── constants/           # Rutas, roles y otras constantes
├── components/          # UI reutilizable
├── pages/
│   ├── public/          # Vistas públicas
│   ├── auth/            # Login, registro, recuperación
│   ├── user/            # Vistas autenticadas (rol 1/2)
│   └── admin/           # Vistas protegidas rol 2
├── services/            # apiClient, auth, queryClient, servicios HTTP
├── hooks/               # Hooks personalizados (useUser)
├── utils/               # Utilidades (fechas, uploads, crop)
└── test/                # Setup de Vitest
```

## Capa de red

`src/services/apiClient.ts` es el punto único para hablar con el backend:

- Añade automáticamente `x-auth-token` desde `sessionStorage`.
- Detecta respuestas `401` y emite el evento `omega:unauthorized` (escuchado por `AuthProvider` para limpiar sesión y forzar re-login).
- Normaliza errores en `ApiError { message, status, data }`.
- Expone helpers tipados: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete`.
- Permite saltarse la auth con `{ skipAuth: true }` para endpoints públicos.

Los servicios HTTP (`appointmentsService`, `availabilityService`, `usersService`, `testimonialsService`, `testimonialsAdminService`) encapsulan los endpoints y exponen funciones nombradas en inglés (`getServices`, `createAppointment`, …).

## Autorización

- `useUser()` (`src/hooks/useUser.ts`) expone `user`, `isAdmin`, `isAuthenticated`, `isAuthLoading`.
- `<ProtectedRoute allowedRoles={[1, 2]}>` protege cualquier vista.
- `<AdminRoute>` es un atajo para `allowedRoles={[2]}`.
- `<RoleRoute allowedRoles={[...]}>` es la versión genérica.

## Tests

```bash
npm run test
```

Cubren `apiClient` (parseo de JSON, headers, 401, helpers), `authContext` (login, logout, persistencia, evento 401), `ProtectedRoute` (redirecciones), `Modal` (escape, loading) y constantes (`routes`, `roles`).