# AGENTS.md — Generador de QR

## Nature
Client-side-only React 18 + Vite 8 app: URL/texto → QR PNG descargable. No backend, login, analytics ni envío de datos. No añadir servidor, autenticación ni telemetría.

## Commands
- Únicos scripts: `npm run dev`, `npm run build`, `npm run preview`. **No hay** test, lint, typecheck ni formatter: verifica con `npm run build` (y `npm audit` si tocas dependencias).
- Vite 8 exige Node `^20.19.0 || >=22.12.0`.
- Windows/PowerShell: `&&` no es separador válido; ejecuta los comandos por separado.

## Wiring
`index.html` → `src/main.jsx` → `src/App.jsx` (toda la UI y la lógica) → `src/index.css`. `vite.config.js` solo registra `@vitejs/plugin-react` (sin aliases, proxy ni env).

## Gotchas
- **Dos copias del logo**: `img/log.png` (raíz, **no la usa la app**) y `public/img/log.png` (la que Vite sirve). Edita la de `public/`. `src/App.jsx` la carga con `import.meta.env.BASE_URL + 'img/log.png'` y `index.html` la usa como favicon en `/img/log.png`; cambiar la copia de la raíz no tiene efecto.
- **Invariante de seguridad** en `analyzeInput()` (`src/App.jsx`): rechaza `javascript:`, `data:`, `vbscript:` y `file:` (incluso ofuscados con espacios), antepone `https://` a dominios y `http://` a `host:puerto`. Es el único punto de normalización/validación; no simplificarlo.
- **Tooltips son solo CSS** mediante atributos `data-tooltip` en `src/index.css`, sin librería. `.generator` no debe llevar `overflow: hidden` o recorta los tooltips; su barra superior tiene `border-radius` propio por eso.
- Los pseudo-elementos de `.result__frame` son las esquinas decorativas: no le añadas `data-tooltip` (el tooltip está en `.result__tag`).

## Constraints del usuario (preservar)
UI en español, colores planos (**sin degradados**), **sin emojis** (iconos SVG), responsiva hasta ~320 px y bloque «Qué hace esta herramienta».
