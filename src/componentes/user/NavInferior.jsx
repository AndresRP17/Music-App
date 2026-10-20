import { useEffect, useState } from "react";
import "./styles/NavInferior.css";

/* ------------------------------------------------
   Iconos (SVG inline, sin dependencias)
   ------------------------------------------------ */
const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const ICONOS = {
  inicio: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.8 2.9 10.2a1 1 0 0 0-.4.8V20a1.2 1.2 0 0 0 1.2 1.2H9v-6h6v6h5.3a1.2 1.2 0 0 0 1.2-1.2v-9a1 1 0 0 0-.4-.8L12 2.8z" />
    </svg>
  ),
  novedades: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="2.2" />
      <rect x="13" y="3" width="8" height="8" rx="2.2" />
      <rect x="3" y="13" width="8" height="8" rx="2.2" />
      <rect x="13" y="13" width="8" height="8" rx="2.2" />
    </svg>
  ),
  radio: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <path {...trazo} d="M8.2 8.2a5.4 5.4 0 0 0 0 7.6M15.8 8.2a5.4 5.4 0 0 1 0 7.6" />
      <path {...trazo} d="M5.4 5.4a9.4 9.4 0 0 0 0 13.2M18.6 5.4a9.4 9.4 0 0 1 0 13.2" />
    </svg>
  ),
  biblioteca: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect {...trazo} x="4.5" y="8.5" width="15" height="12" rx="3" />
      <path {...trazo} d="M7 5.5h10M9 2.8h6" />
      <path {...trazo} d="M10.5 17.2v-4.6l4-.9v4.6" />
      <circle cx="9.4" cy="17.4" r="1.2" fill="currentColor" />
      <circle cx="13.4" cy="16.5" r="1.2" fill="currentColor" />
    </svg>
  ),
  buscar: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle {...trazo} cx="10.5" cy="10.5" r="6.5" strokeWidth={2.2} />
      <path {...trazo} d="m15.6 15.6 5 5" strokeWidth={2.2} />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.3v13.4a1 1 0 0 0 1.5.9l10.6-6.7a1 1 0 0 0 0-1.8L9.5 4.4A1 1 0 0 0 8 5.3z" />
    </svg>
  ),
  pausa: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="6" y="4.5" width="4.2" height="15" rx="1.2" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" />
    </svg>
  ),
  siguiente: (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M2.8 5.8v12.4a.9.9 0 0 0 1.4.7l8-6.2a.9.9 0 0 0 0-1.4l-8-6.2a.9.9 0 0 0-1.4.7z" />
      <path d="M12.6 5.8v12.4a.9.9 0 0 0 1.4.7l8-6.2a.9.9 0 0 0 0-1.4l-8-6.2a.9.9 0 0 0-1.4.7z" />
    </svg>
  ),
};

const TABS_POR_DEFECTO = [
  { id: "inicio", label: "Inicio", icono: "inicio" },
  { id: "novedades", label: "Novedades", icono: "novedades" },
  { id: "radio", label: "Radio", icono: "radio" },
  { id: "biblioteca", label: "Biblioteca", icono: "biblioteca" },
];

/**
 * Barra inferior estilo Apple Music (Liquid Glass):
 * - Arriba del todo: mini reproductor + barra de pestañas + botón de búsqueda.
 * - Al scrollear hacia abajo: la pestaña activa se vuelve un círculo,
 *   el reproductor se estira en el medio y el buscador queda a la derecha.
 *
 * Props:
 *  tabs            [{ id, label, icono }]  (icono: "inicio" | "novedades" | "radio" | "biblioteca" o un nodo React)
 *  activa          id de la pestaña activa
 *  onCambiar(id)   se llama al tocar una pestaña
 *  cancion         { titulo, artista, portada } o null (sin canción no se muestra el reproductor)
 *  reproduciendo   boolean
 *  onPlayPause, onSiguiente, onAbrirReproductor, onBuscar
 *  scrollRef       ref del contenedor que scrollea (si es la ventana, no hace falta)
 *  acento          color CSS para la pestaña activa (por defecto usa --accent)
 */
export default function NavInferior({
  tabs = TABS_POR_DEFECTO,
  activa,
  onCambiar,
  cancion = null,
  reproduciendo = false,
  onPlayPause,
  onSiguiente,
  onAbrirReproductor,
  onBuscar,
  scrollRef = null,
  acento = null,
}) {
  const [bajando, setBajando] = useState(false);

  const hayCancion = Boolean(cancion);
  // Sin canción no hay reproductor, así que no tiene sentido colapsar
  const colapsada = bajando && hayCancion;

  // Detecta la dirección del scroll
  useEffect(() => {
    const objetivo = scrollRef?.current ?? window;
    const leerY = () =>
      objetivo === window ? window.scrollY : objetivo.scrollTop;

    let ultimo = leerY();

    const onScroll = () => {
      const y = leerY();
      const delta = y - ultimo;

      if (y < 24) setBajando(false);
      else if (delta > 8) setBajando(true);
      else if (delta < -8) setBajando(false);

      ultimo = y;
    };

    objetivo.addEventListener("scroll", onScroll, { passive: true });
    return () => objetivo.removeEventListener("scroll", onScroll);
  }, [scrollRef]);

  const tocarPestana = (id) => {
    // En modo colapsado, tocar el círculo vuelve a abrir la barra
    if (colapsada) {
      setBajando(false);
      return;
    }
    onCambiar?.(id);
  };

  const clases = [
    "mb",
    hayCancion ? "" : "mb--sin-cancion",
    colapsada ? "mb--colapsada" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <nav
      className={clases}
      aria-label="Navegación principal"
      style={acento ? { "--mb-acento": acento } : undefined}
    >
      {hayCancion && (
        <div
          className="mb-glass mb-player"
          onClick={onAbrirReproductor}
          role="group"
          aria-label="Reproductor"
        >
          <div
            className="mb-cover"
            style={
              cancion.portada
                ? { backgroundImage: `url(${cancion.portada})` }
                : undefined
            }
          />

          <div className="mb-info">
            <span className="mb-title">{cancion.titulo}</span>
            <span className="mb-artist">{cancion.artista}</span>
          </div>

          <button
            type="button"
            className="mb-btn mb-play"
            aria-label={reproduciendo ? "Pausar" : "Reproducir"}
            onClick={(e) => {
              e.stopPropagation();
              onPlayPause?.();
            }}
          >
            {reproduciendo ? ICONOS.pausa : ICONOS.play}
          </button>

          <button
            type="button"
            className="mb-btn mb-next"
            aria-label="Siguiente"
            onClick={(e) => {
              e.stopPropagation();
              onSiguiente?.();
            }}
          >
            {ICONOS.siguiente}
          </button>
        </div>
      )}

      <div className="mb-glass mb-tabs">
        {tabs.map((tab) => {
          const esActiva = tab.id === activa;
          const icono =
            typeof tab.icono === "string" ? ICONOS[tab.icono] : tab.icono;

          return (
            <button
              key={tab.id}
              type="button"
              className={`mb-tab ${esActiva ? "mb-tab--activa" : ""}`}
              aria-current={esActiva ? "page" : undefined}
              onClick={() => tocarPestana(tab.id)}
            >
              <span className="mb-tab-icon">{icono}</span>
              <span className="mb-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        className="mb-glass mb-search"
        aria-label="Buscar"
        onClick={onBuscar}
      >
        {ICONOS.buscar}
      </button>
    </nav>
  );
}