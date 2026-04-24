# 🏆 Panini Mundial 2026 — App de Conteo

App para llevar el conteo de tu álbum Panini FIFA World Cup 2026.

## Requisitos

- **Node.js 18+** (ya lo tienes si haces desarrollo web; si no: https://nodejs.org)

## Cómo correrla en local

Abre una terminal en esta carpeta y ejecuta:

```bash
npm install
npm run dev
```

La app se abrirá automáticamente en **http://localhost:5173**

## Cómo funciona

- Tu progreso se guarda automáticamente en `localStorage` del navegador
- Si abres la app en otro navegador o modo incógnito, tendrás una colección separada
- Para borrar todo: abre DevTools (F12) → Application → Local Storage → elimina `panini2026-collection`

## Scripts disponibles

- `npm run dev` — servidor de desarrollo con hot-reload
- `npm run build` — compila para producción en `dist/`
- `npm run preview` — sirve la build de producción para probar

## Estructura

```
panini-app/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx              ← entry point
    └── PaniniMundial2026.jsx ← la app completa
```

¡A coleccionar! ⚽
