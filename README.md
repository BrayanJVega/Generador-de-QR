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

## Notas de seguridad

- `analyzeInput()` en `src/App.jsx` es el único punto de validación: rechaza protocolos peligrosos incluso si se intentan ofuscar con espacios, y antepone el protocolo adecuado a dominios y a direcciones `host:puerto`.
- No existen scripts de test, lint ni typecheck. La verificación principal es `npm run build`.
