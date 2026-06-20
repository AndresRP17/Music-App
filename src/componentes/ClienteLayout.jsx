import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import ReproductorExpandido from "./ReproductorExpandido";

function LayoutCliente({ trackActual, setTrackActual, cerrarSesion }) {
  const [expandido, setExpandido] = useState(false);

  return (
    <div className="container">
      <Sidebar cerrarSesion={cerrarSesion} />
      <Outlet />

      {trackActual && (
        <>
          <div className="reproductor-fijo-abajo">
            <div className="reproductor-info-tema" onClick={() => setExpandido(true)} style={{ cursor: 'pointer' }}>
              <img src={trackActual.cover} alt={trackActual.title} className="reproductor-portada" />
              <div>
                <h4 className="reproductor-titulo">{trackActual.title}</h4>
                <p className="reproductor-artista">{trackActual.artist}</p>
              </div>
            </div>
            <audio src={trackActual.url} controls autoPlay className="reproductor-audio" />
            <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
          </div>

          {expandido && (
            <ReproductorExpandido
              trackActual={trackActual}
              onCerrar={() => setExpandido(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default LayoutCliente;