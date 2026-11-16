import { useMemo, useState } from 'react';
import QRCode from 'qrcode';

// Protocolos que nunca deben codificarse: al escanearse podrían ejecutar código
// o acceder a archivos locales del dispositivo.
const DANGEROUS_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:'];

/**
 * Analiza la entrada del usuario y decide qué se va a codificar.
 * Devuelve:
 *  - kind: 'url' | 'text' | 'danger' | 'empty'
 *  - value: el valor final que se codificará en el QR
 */
function analyzeInput(raw) {
  const value = raw.trim();
  if (!value) return { kind: 'empty', value: '' };

  // Se ignoran espacios internos para detectar esquemas ofuscados
  // (p. ej. "java script:alert(1)").
  const compact = value.replace(/\s+/g, '');
  const schemeMatch = compact.match(/^([a-zA-Z][a-zA-Z0-9+.-]*):/);

  if (schemeMatch) {
    const scheme = schemeMatch[1].toLowerCase();

    if (DANGEROUS_PROTOCOLS.includes(`${scheme}:`)) {
      return { kind: 'danger', value, scheme };
    }

    if (scheme === 'http' || scheme === 'https') {
      return { kind: 'url', value };
    }

    // Host: Puerto (p. ej. localhost:3000, ejemplo.com:8080)
    const rest = value.slice(schemeMatch[0].length);
    if (/^\d+([/?#]|$)/.test(rest)) {
      return { kind: 'url', value: `http://${value}` };
    }

    // Otros esquemas legítimos (mailto:, tel:, sms:, etc.) se tratan como texto.
    return { kind: 'text', value };
  }

  // Parece un dominio (contiene un punto, sin espacios) => se asume https://
  const looksLikeDomain = /^[^\s/@]+(\.[^\s/@]+)+([/?#][^\s]*)?$/.test(value);
  if (looksLikeDomain) {
    return { kind: 'url', value: `https://${value}` };
  }

  return { kind: 'text', value };
}

const SIZES = [
  { label: 'Compacto · 256 px', value: 256 },
  { label: 'Estándar · 512 px', value: 512 },
  { label: 'Alta resolución · 1024 px', value: 1024 },
];

const LOGO = `${import.meta.env.BASE_URL}img/log.png`;

/* Iconos SVG (no son emojis: escalan y mantienen un estilo consistente). */
function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 10.5l3.5 3.5L16 5.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5l8-3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 12l2.3 2.3L15.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 2v10m0 0l-4-4m4 4l4-4M3 15v2h14v-2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function App() {
  const [input, setInput] = useState('');
  const [darkColor, setDarkColor] = useState('#111827');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [size, setSize] = useState(512);
  const [correction, setCorrection] = useState('M');
  const [qr, setQr] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const preview = useMemo(() => analyzeInput(input), [input]);

  const inputTooltip =
    preview.kind === 'danger'
      ? 'Protocolo bloqueado por seguridad. Usa una URL http:// o https://.'
      : preview.kind === 'url'
        ? 'Se añade https:// automáticamente si lo omites. Al escanearlo se abrirá el enlace.'
        : 'Al escanearlo se mostrará este texto. Escribe una URL para abrir una página.';

  async function handleGenerate(event) {
    event.preventDefault();
    setError('');
    setQr(null);

    const result = analyzeInput(input);

    if (result.kind === 'empty') {
      setError('Escribe una URL o un texto para generar el código QR.');
      return;
    }

    if (result.kind === 'danger') {
      setError(
        `El protocolo "${result.scheme}:" no está permitido por seguridad. Usa una URL http:// o https://.`
      );
      return;
    }

    setBusy(true);
    try {
      const dataUrl = await QRCode.toDataURL(result.value, {
        width: size,
        margin: 2,
        errorCorrectionLevel: correction,
        color: {
          dark: darkColor,
          light: lightColor,
        },
      });
      setQr({ dataUrl, value: result.value, kind: result.kind });
    } catch (err) {
      console.error(err);
      setError('No se pudo generar el QR. Revisa el contenido e inténtalo de nuevo.');
    } finally {
      setBusy(false);
    }
  }

  function handleDownload() {
    if (!qr) return;
    const link = document.createElement('a');
    link.href = qr.dataUrl;
    link.download = 'codigo-qr.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleClear() {
    setInput('');
    setQr(null);
    setError('');
  }

  return (
    <div className="page">
      <div className="shell">
        <aside className="intro">
          <div className="brand">
            <span className="brand__mark" tabIndex={0} data-tooltip="Logo de QR Studio">
              <img src={LOGO} alt="Logo de QR Studio" />
            </span>
            <span className="brand__name">QR / STUDIO</span>
          </div>

          <p className="eyebrow">Herramienta local · Sin registro</p>
          <h1>
            Tu enlace, <span>codificado</span> al instante.
          </h1>
          <p className="lede">
            Pega una dirección o escribe un texto y obtén un código QR listo para escanear y descargar.
          </p>

          <section className="note" aria-label="Qué hace esta herramienta">
            <h2>Qué hace esta herramienta</h2>
            <p>
              Convierte lo que introduzcas en un código QR. Si es un enlace, al escanearlo con un
              teléfono se abrirá directamente esa página. Si es texto, el teléfono lo mostrará en
              pantalla. Todo ocurre dentro de tu navegador: no se guarda ni se envía nada a ningún
              servidor, y no necesitas iniciar sesión.
            </p>
          </section>

          <ul className="features">
            <li data-tooltip="No hay formularios de registro ni cuentas de usuario.">
              <CheckIcon /><span>Sin cuentas ni formularios</span>
            </li>
            <li data-tooltip="El QR se crea en tu equipo; ningún dato se sube a internet.">
              <CheckIcon /><span>Privado por diseño: nada sale de tu equipo</span>
            </li>
            <li data-tooltip="Puedes elegir hasta 1024 px para imprimir sin perder nitidez.">
              <CheckIcon /><span>Descarga en PNG de alta resolución</span>
            </li>
          </ul>

          <div
            className="security"
            data-tooltip="Se rechazan javascript:, data:, vbscript: y file: para impedir QRs que ejecuten acciones maliciosas."
          >
            <ShieldIcon />
            <p>
              <strong>Protección activa.</strong> Se bloquean protocolos peligrosos como
              <code> javascript:</code> o <code>data:</code> para evitar QRs maliciosos.
            </p>
          </div>
        </aside>

        <main className="generator">
          <div className="generator__head">
            <span className="generator__index">01 / Generador</span>
            <h2>Crea tu código</h2>
          </div>

          <form onSubmit={handleGenerate} noValidate>
            <label className="label" htmlFor="qr-input">Enlace o texto</label>
            <div className="input-wrap" data-tooltip={inputTooltip}>
              <input
                id="qr-input"
                type="text"
                autoComplete="off"
                spellCheck="false"
                placeholder="https://ejemplo.com  o  escribe cualquier texto"
                value={input}
                onChange={(event) => setInput(event.target.value)}
              />
              {preview.kind !== 'empty' && (
                <span className={`badge badge--${preview.kind}`}>
                  {preview.kind === 'url'
                    ? 'Enlace web'
                    : preview.kind === 'danger'
                      ? 'Bloqueado'
                      : 'Texto'}
                </span>
              )}
            </div>

            {preview.kind === 'url' && input.trim() !== preview.value && (
              <p className="hint">Se codificará como: <code>{preview.value}</code></p>
            )}

            {error && (
              <p className="error" role="alert">{error}</p>
            )}

            <details className="options">
              <summary>
                <span className="tip-text" data-tooltip="Ajusta la resolución, la tolerancia a daños y los colores del QR.">
                  Ajustes de diseño
                </span>
              </summary>
              <div className="options-grid">
                <div className="field" data-tooltip="Resolución del PNG. Un tamaño mayor da más nitidez al imprimir.">
                  <label className="label" htmlFor="size">Tamaño</label>
                  <select
                    id="size"
                    value={size}
                    onChange={(event) => setSize(Number(event.target.value))}
                  >
                    {SIZES.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="field" data-tooltip="Más redundancia permite que el QR siga legible si se rayan o ensucian algunas celdas.">
                  <label className="label" htmlFor="correction">Corrección de errores</label>
                  <select
                    id="correction"
                    value={correction}
                    onChange={(event) => setCorrection(event.target.value)}
                  >
                    <option value="L">Baja</option>
                    <option value="M">Media</option>
                    <option value="Q">Alta</option>
                    <option value="H">Muy alta</option>
                  </select>
                </div>

                <div className="field" data-tooltip="Color de los módulos oscuros del código.">
                  <label className="label" htmlFor="dark">Color oscuro</label>
                  <div className="color-field">
                    <input
                      id="dark"
                      type="color"
                      value={darkColor}
                      onChange={(event) => setDarkColor(event.target.value)}
                    />
                    <span>{darkColor}</span>
                  </div>
                </div>

                <div className="field" data-tooltip="Color del fondo. Debe contrastar bien con el color oscuro.">
                  <label className="label" htmlFor="light">Color claro</label>
                  <div className="color-field">
                    <input
                      id="light"
                      type="color"
                      value={lightColor}
                      onChange={(event) => setLightColor(event.target.value)}
                    />
                    <span>{lightColor}</span>
                  </div>
                </div>
              </div>
            </details>

            <div className="actions">
              <button
                className="btn btn--primary"
                type="submit"
                disabled={busy}
                data-tooltip="Genera el código QR con el contenido y los ajustes actuales."
              >
                {busy ? 'Generando…' : 'Generar código QR'}
              </button>
              <button
                className="btn btn--ghost"
                type="button"
                onClick={handleClear}
                disabled={!input && !qr}
                data-tooltip="Borra el texto escrito y el resultado."
              >
                Limpiar
              </button>
            </div>
          </form>

          {qr && (
            <section className="result" aria-live="polite">
              <span
                className="result__tag"
                data-tooltip="Apunta la cámara de un teléfono hacia el código para abrirlo."
              >
                Resultado
              </span>
              <div className="result__frame">
                <img src={qr.dataUrl} alt="Código QR generado" />
              </div>
              <p className="result-value" title={qr.value}>{qr.value}</p>
              <button
                className="btn btn--download"
                type="button"
                onClick={handleDownload}
                data-tooltip="Guarda el código QR en tu dispositivo como archivo PNG."
              >
                <DownloadIcon /> Descargar PNG
              </button>
            </section>
          )}
        </main>
      </div>

      <footer className="footer">
        <span>QR / STUDIO</span>
        <span>Generación local · Sin inicio de sesión · Sin seguimiento</span>
      </footer>
    </div>
  );
}
