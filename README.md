# Generador de QR

Aplicación web que convierte un enlace o cualquier texto en un código QR listo para escanear y descargar como PNG.

Todo el proceso ocurre **dentro del navegador**: no hay servidor, no se requiere inicio de sesión y ningún dato se envía a internet.

## Características

- Acepta URLs y texto libre con detección automática del tipo de contenido.
- Normalización de enlaces: si escribes `ejemplo.com` se guarda como `https://ejemplo.com`.
- Descarga del QR en PNG con tamaños de 256, 512 o 1024 px.
- Ajustes de color y nivel de corrección de errores.
- Interfaz en español, responsiva y sin emojis.
- Bloqueo de protocolos peligrosos (`javascript:`, `data:`, `vbscript:`, `file:`).

## Tecnología

React 18 + Vite 8. La generación del QR se realiza en el cliente con la librería [`qrcode`](https://www.npmjs.com/package/qrcode).

## Requisitos

Node.js `^20.19.0 || >=22.12.0` (requerido por Vite 8).

## Instalación y uso

```powershell
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Producción

```powershell
npm run build
npm run preview
```

`npm run build` genera la versión estática en `dist/`. Ese directorio se puede subir tal cual a cualquier hosting de archivos estáticos (GitHub Pages, Netlify, etc.).

> En Windows/PowerShell, `&&` no es un separador de comandos válido: ejecuta cada comando en una línea o llamada separada.

## Estructura

```
.
├── index.html          # Entrada HTML y favicon (/img/log.png)
├── public/
│   └── img/log.png     # Logo servido por Vite (favicon y encabezado)
├── src/
│   ├── main.jsx        # Montaje de React
│   ├── App.jsx         # UI, validación de entrada y generación del QR
│   └── index.css       # Estilos, tooltips y diseño responsivo
├── vite.config.js      # Configuración mínima de Vite + plugin de React
└── package.json
```

## Despliegue en GitHub Pages

La configuración usa `base: './'` en `vite.config.js`, por lo que funciona en cualquier nombre de repositorio sin cambios previos.

1. Crea el repositorio en GitHub y sube el proyecto (rama `main`).
2. En el repo ve a **Settings → Pages → Build and deployment** y en **Source** selecciona **GitHub Actions**.
3. Haz un push a `main`. El workflow `.github/workflows/deploy.yml` instala dependencias, ejecuta `npm run build` y publica el contenido de `dist/`.
4. El progreso se ve en la pestaña **Actions**. La URL final aparece en **Settings → Pages**.

> El workflow usa Node 22 (Vite 8 requiere `^20.19.0 || >=22.12.0`). Si tu rama no es `main`, cambia `branches: [main]` en el workflow.

## Notas de seguridad

- `analyzeInput()` en `src/App.jsx` es el único punto de validación: rechaza protocolos peligrosos incluso si se intentan ofuscar con espacios, y antepone el protocolo adecuado a dominios y a direcciones `host:puerto`.
- No existen scripts de test, lint ni typecheck. La verificación principal es `npm run build`.
