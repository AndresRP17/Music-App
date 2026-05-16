// src/componentes/LayoutCliente.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

function LayoutCliente({ trackActual, setTrackActual }) {
  return (
    <div className="container">
      {/* El menú lateral del cliente */}
      <Sidebar />

      {/* Aquí React va a renderizar Home, Search, Playlists o AlbumDetail */}
      <Outlet />

      {/* Tu reproductor fijo de abajo se queda acá, exclusivo del cliente */}
      {trackActual && (
        <div className="reproductor-fijo-abajo">
          <div className="reproductor-info-tema">
            <img src={trackActual.cover} alt={trackActual.title} className="reproductor-portada" />
            <div>
              <h4 className="reproductor-titulo">{trackActual.title}</h4>
              <p className="reproductor-artista">{trackActual.artist}</p>
            </div>
          </div>
          <audio src={trackActual.url} controls autoPlay className="reproductor-audio" />
          <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
        </div>
      )}
    </div>
  );
}

export default LayoutCliente;