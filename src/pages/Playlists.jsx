import { useState, useEffect } from 'react';
import { FaPlay } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";

import './Playlist.css';

const Playlist = ({ setTrackActual }) => {
  // Devolvemos los estados aquí adentro para que App.jsx quede limpio
  const [cancionesFavoritas, setCancionesFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [trackCargando, setTrackCargando] = useState(null); 
  const [favoritosIds, setFavoritosIds] = useState([]);

  // 1. FUNCIÓN PARA OBTENER LOS FAVORITOS
  const obtenerFavoritos = async () => {
    try {
      const response = await fetch('http://localhost:8086/favorites', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        setCancionesFavoritas(data); 
      } else {
        console.error("Error al obtener canciones del servidor");
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setCargando(false);
    }
  };

  // 2. EFECTO PARA TRAER LOS DATOS AL CARGAR EL COMPONENTE
  useEffect(() => {
    obtenerFavoritos();
  }, []);

  // 3. FUNCIÓN PARA ELIMINAR CANCIÓN (Ubicada correctamente antes del return de carga)
  const eliminarCancion = async (id) => {
    try {
      const response = await fetch(`/api/favorites/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setCancionesFavoritas(prev =>
          prev.filter(c => c.id !== id)
        );
      } else {
        console.error("No se pudo eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 4. FUNCIÓN PARA REPRODUCIR PISTA EN DEEZER
  const reproducirPista = async (cancion, index) => {
    setTrackCargando(index); 
    try {
      const query = `${cancion.artist} ${cancion.title}`;
      const response = await fetch(`/deezer/search?q=${encodeURIComponent(query)}`);
      const data = await response.json(); 

      if (data.data && data.data.length > 0) {
        const trackEncontrado = data.data[0]; 
        setTrackActual({
          title: cancion.title,
          artist: cancion.artist,
          url: trackEncontrado.preview, 
          cover: trackEncontrado.album?.cover_medium || 'https://via.placeholder.com/150'
        });
      } else {
        alert(`No se encontró vista previa de audio para "${cancion.title}"`);
      }
    } catch (error) {
      console.error("Error consultando la API de Deezer:", error);
    } finally {
      setTrackCargando(null); 
    }
  };

  // VISTA DE CARGA (React Hooks listos arriba, ahora sí podemos hacer returns condicionales)
  if (cargando) {
    return (
      <div className="playlist-loading-view">
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  // RENDER PRINCIPAL DE LA PLAYLIST
  return (
    <div className="playlist-container">
      <header className="playlist-header">
        <h1>Tu Playlist</h1>
        <p className="playlist-subtitle">Tu colección de música personalizada</p>
      </header>

      {/* Protección con cortocircuito: si por alguna razón es undefined, usa un array vacío */}
      {(cancionesFavoritas || []).length === 0 ? (
        <div className="playlist-no-songs">
          <h2>Aquí aparecerán tus canciones</h2>
          <p>No tienes favoritos agregados todavía. ¡Explora álbumes para sumar música!</p>
        </div>
      ) : (
        <div className="playlist-tracklist-section">
          
          <div className="playlist-tracklist-header">
            <span>#</span>
            <span>TÍTULO</span>
            <span>ÁLBUM</span>
            <span style={{ textAlign: 'right', paddingRight: '4px' }}>DURACIÓN</span>
          </div>
          <hr />

          <div className="tracklist">
            {(cancionesFavoritas || []).map((cancion, index) => {
              // SEPARACIÓN INTELIGENTE: Si el título viene mezclado por un guion
              let tituloLimpio = cancion.title;
              let albumDetectado = cancion.album || "—";

              if (cancion.title && cancion.title.includes('-')) {
                const partes = cancion.title.split('-');
                tituloLimpio = partes[0].trim();
                albumDetectado = partes[1].trim();
              }

              return (
                <div key={cancion.id || index} className="playlist-track-row">
                  
                  {/* 1. NÚMERO / PLAY CONTROL */}
                  <div className="playlist-track-number-wrapper">
                    <span className="playlist-track-number">{index + 1}</span>
                    <button 
                      className="playlist-play-row-btn" 
                      onClick={() => reproducirPista(cancion, index)}
                      disabled={trackCargando === index}
                    >
                      {trackCargando === index ? (
                        <span className="mini-spinner">...</span>
                      ) : (
                        <FaPlay style={{ fontSize: '15px', marginLeft: '1px' }} />
                      )}
                    </button>
                  </div>

                  {/* 2. TÍTULO Y ARTISTA */}
                  <div className="playlist-meta-container">
                    <span className="playlist-track-name">{tituloLimpio}</span>
                    <span className="playlist-artist-name">{cancion.artist}</span>
                  </div>

                  {/* 3. ÁLBUM */}
                  <span className="playlist-album-name">
                    {albumDetectado}
                  </span>

                  {/* 4. DURACIÓN */}
                  <span className="playlist-track-duration">
                    {cancion.duration 
                      ? `${Math.floor(cancion.duration / 60)}:${(cancion.duration % 60).toString().padStart(2, '0')}`
                      : "0:00"
                    }
                  </span>

                  {/* 5. BOTÓN ELIMINAR */}
                  <button
                    className="playlist-delete-btn"
                    onClick={() => eliminarCancion(cancion.id)}
                  >
                    <MdDelete/>
                  </button>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playlist;