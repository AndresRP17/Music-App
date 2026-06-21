import { useState, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ReproductorExpandido from "./ReproductorExpandido";

function ClienteLayout({ trackActual, setTrackActual, cerrarSesion }) {
  const [expandido, setExpandido] = useState(false);
  const audioRef = useRef(null);

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

            {/* Se oculta cuando el modal está abierto, pero sigue existiendo y sonando */}
            <audio
              ref={audioRef}
              src={trackActual.url}
              controls
              autoPlay
              className="reproductor-audio"
              style={{ visibility: expandido ? 'hidden' : 'visible' }}
            />

            <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
          </div>

          {expandido && (
            <ReproductorExpandido
              trackActual={trackActual}
              audioRef={audioRef}
              onCerrar={() => setExpandido(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default ClienteLayout;