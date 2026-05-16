import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react"; // 1. Importamos useState para manejar la música

import './App.css'
import Sidebar from './componentes/Sidebar'
import Home from "./pages/Home";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import AlbumDetail from "./pages/AlbumDetails";

function App() {
  // 2. Creamos el estado global de la canción. Arranca en null (vacio).
  const [trackActual, setTrackActual] = useState(null);

  return (
    <BrowserRouter>
      <div className="container">
        <Sidebar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          
          {/* 3. ¡CONEXIÓN CLAVE!: Le pasamos setTrackActual como una prop a AlbumDetail */}
          <Route 
            path="/album/:albumName/:artistName" 
            element={<AlbumDetail setTrackActual={setTrackActual} />} 
          />
          
          <Route path="/playlist" element={<Playlists />} />
        </Routes>

        {/* 4. EL REPRODUCTOR ESTILO ITUNES (Aparece abajo solo cuando hay una canción cargada) */}
        {trackActual && (
          <div className="reproductor-fijo-abajo">
            <div className="reproductor-info-tema">
              <img src={trackActual.cover} alt={trackActual.title} className="reproductor-portada" />
              <div>
                <h4 className="reproductor-titulo">{trackActual.title}</h4>
                <p className="reproductor-artista">{trackActual.artist}</p>
              </div>
            </div>
            
            {/* El control de audio nativo que va a hacer sonar los 30 segundos de Deezer */}
            <audio src={trackActual.url} controls autoPlay className="reproductor-audio" />
            
            <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
          </div>
        )}

      </div>
    </BrowserRouter>
  )
}

export default App