import { useState, useRef, useEffect } from "react";  // ← agregá useEffect
import { Outlet } from "react-router-dom";
import ReproductorExpandido from "./ReproductorExpandido";
import Sidebar from "./Sidebar";

function ClienteLayout({ trackActual, setTrackActual, listaActual, indexActual, reproducirLista, cerrarSesion, onPausarRef }) {
  const [expandido, setExpandido] = useState(false);
  const audioRef = useRef(null);

 useEffect(() => {
  if (onPausarRef) {
    onPausarRef.current = () => audioRef.current?.pause();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const buscarYReproducir = async (index) => {
    const cancion = listaActual[index];
    if (!cancion) return;

    if (cancion.url) {
      reproducirLista(listaActual, index);
      return;
    }

    try {
      const query = `${cancion.artist} ${cancion.title}`;
      const res = await fetch(`/deezer/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const track = data.data[0];
        const listaActualizada = listaActual.map((t, i) =>
          i === index ? { ...t, url: track.preview, cover: track.album?.cover_medium || t.cover } : t
        );
        reproducirLista(listaActualizada, index);
      }
    } catch (err) {
      console.error("Error buscando en Deezer:", err);
    }
  };

  const reproducirAnterior = () => {
    if (listaActual.length === 0 || indexActual <= 0) return;
    buscarYReproducir(indexActual - 1);
  };

  const reproducirSiguiente = () => {
    if (listaActual.length === 0 || indexActual >= listaActual.length - 1) return;
    buscarYReproducir(indexActual + 1);
  };

  return (
    <div className="container">
      <Sidebar cerrarSesion={cerrarSesion} />
      <Outlet />

      {trackActual && (
        <>
          <div className="reproductor-fijo-abajo">
            <div
              className="reproductor-info-tema"
              onClick={() => setExpandido(true)}
              style={{ cursor: 'pointer' }}
            >
              <img src={trackActual.cover} alt={trackActual.title} className="reproductor-portada" />
              <div>
                <h4 className="reproductor-titulo">{trackActual.title}</h4>
                <p className="reproductor-artista">{trackActual.artist}</p>
              </div>
            </div>

            <audio
              ref={audioRef}
              src={trackActual.url}
              controls
              autoPlay
              className="reproductor-audio"
              style={{ visibility: expandido ? 'none' : 'visible' }}
            />

            <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
          </div>

          {expandido && (
            <ReproductorExpandido
              trackActual={trackActual}
              audioRef={audioRef}
              listaActual={listaActual}
              indexActual={indexActual}
              onAnterior={reproducirAnterior}
              onSiguiente={reproducirSiguiente}
              onCerrar={() => setExpandido(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ClienteLayout;