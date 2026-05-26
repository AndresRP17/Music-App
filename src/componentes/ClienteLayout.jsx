// src/componentes/LayoutCliente.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// 🚀 PASO 1: Agregamos 'cerrarSesion' a las llaves para recibirlo desde App.jsx
function LayoutCliente({ trackActual, setTrackActual, cerrarSesion }) {
  return (
    <div className="container">
      {/* 🚀 PASO 2: Se lo pasamos al Sidebar como prop */}
      <Sidebar cerrarSesion={cerrarSesion} />

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