# Front-end Relojería y Joyería OMEGA

SPA construida con **React 18**, **Vite**, **React Router** y **Tailwind CSS** que consume un backend Node/Express externo en `http://localhost:4000`.

## Características

- Catálogo, blog y eventos públicos.
- Registro e inicio de sesión con JWT (almacenado en `sessionStorage`).
- Perfil editable con recorte de imagen.
- Solicitudes de personalización, citas y reseñas.
- Panel de administración: usuarios, artículos, citas, disponibilidades, servicios, eventos, productos y reseñas.

## Configuración

```bash
cp .env.example .env       # ajusta VITE_API_URL si el backend está en otro host
npm install
npm run dev
```

## Variables de entorno

| Variable        | Descripción                              |
|-----------------|------------------------------------------|
| `VITE_API_URL`  | URL base del backend (sin slash final).  |

## Scripts

| Comando         | Descripción                       |
|-----------------|-----------------------------------|
| `npm run dev`   | Inicia el servidor de desarrollo.|
| `npm run build` | Compila a `dist/`.                |
| `npm run lint`  | Ejecuta ESLint.                   |
| `npm run preview` | Sirve el build de producción.   |

## Estructura

```
src/
├── App.jsx             # Router y layout
├── main.jsx            # Bootstrap React
├── index.css           # Tailwind base
├── components/         # UI reutilizable
├── pages/
│   ├── Admin/          # Vistas protegidas rol 2
│   ├── Comun/          # Vistas públicas
│   └── Usuario/        # Vistas protegidas rol 1/2
├── services/           # Clientes HTTP y contextos
└── utils/              # Utilidades (fechas, uploads, crop)
```

Las llamadas al backend pasan siempre por `src/services/apiClient.js`, que añade automáticamente el header `x-auth-token` cuando hay sesión activa.