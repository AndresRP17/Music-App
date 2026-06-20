import { useState, useEffect } from 'react';
import { FaPlay, FaSearch } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import Publicidad from './Publicidad';
import './Favorites.css';

const esProd = window.location.hostname.includes("netlify");

const Favorites = ({ setTrackActual }) => {
  const [cancionesFavoritas, setCancionesFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [trackCargando, setTrackCargando] = useState(null); 
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const obtenerFavoritos = async () => {
    // En Netlify: leer del localStorage
    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem("favoritos") || "[]");
      setCancionesFavoritas(guardadas);
      setCargando(false);
      return;
    }
    // Local: leer del backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        }
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

  useEffect(() => {
    obtenerFavoritos();
  }, []);

  const cancionesFiltradas = (cancionesFavoritas || []).filter(cancion => {
    const query = busqueda.toLowerCase();
    return (
      cancion.title?.toLowerCase().includes(query) ||
      cancion.artist?.toLowerCase().includes(query) ||
      cancion.album?.toLowerCase().includes(query)
    );
  });

  const eliminarCancion = async (id) => {
    // En Netlify: eliminar del localStorage
    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem("favoritos") || "[]");
      const nuevas = guardadas.filter(c => c.id !== id);
      localStorage.setItem("favoritos", JSON.stringify(nuevas));
      setCancionesFavoritas(nuevas);
      return;
    }
    // Local: eliminar del backend
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCancionesFavoritas(prev => prev.filter(c => c.id !== id));
      } else {
        console.error("No se pudo eliminar");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const reproducirPista = async (cancion, index) => {
    setTrackCargando(index);

    const esPremium = localStorage.getItem("esPremium") === "true";
    if (!esPremium) {
      const clicks = parseInt(localStorage.getItem('contadorPublicidad')) || 0;
      const siguiente = clicks + 1;
      if (siguiente >= 3) {
        localStorage.setItem('contadorPublicidad', '0');
        setTrackCargando(null);
        setMostrarPublicidad(true);
        return;
      } else {
        localStorage.setItem('contadorPublicidad', siguiente.toString());
      }
    }

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

  if (cargando) {
    return (
      <div className="playlist-loading-view">
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="playlist-container">

      {mostrarPublicidad && (
        <Publicidad onCerrar={() => setMostrarPublicidad(false)} />
      )}

      <header className="playlist-header">
        <h1>Tus Favoritos</h1>
        <p className="playlist-subtitle">Tu colección de música favorita</p>
      </header>

      {cancionesFavoritas.length > 0 && (
        <div className="playlist-search-wrapper">
          <FaSearch className="playlist-search-icon" />
          <input
            type="text"
            className="playlist-search-input"
            placeholder="Buscar por título, artista o álbum..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      )}

      {cancionesFavoritas.length === 0 ? (
        <div className="playlist-no-songs">
          <h2>Aquí aparecerán tus canciones</h2>
          <p>No tienes favoritos agregados todavía. ¡Explora álbumes para sumar música!</p>
        </div>
      ) : cancionesFiltradas.length === 0 ? (
        <div className="playlist-no-songs">
          <h2>Sin resultados</h2>
          <p>No se encontraron canciones que coincidan con "<strong>{busqueda}</strong>"</p>
        </div>
      ) : (
        <div className="playlist-tracklist-section">
          <div className="playlist-tracklist-header">
            <span>#</span>
            <span>TÍTULO</span>
            <span>ÁLBUM</span>
            <span style={{ textAlign: 'right', paddingRight: '4px' }}>DURACIÓN</span>
            <span></span> 
          </div>
          <hr />
          <div className="tracklist">
            {cancionesFiltradas.map((cancion, index) => {
              let tituloLimpio = cancion.title;
              let albumDetectado = cancion.album || "—";
              if (cancion.title && cancion.title.includes('-')) {
                const partes = cancion.title.split('-');
                tituloLimpio = partes[0].trim();
                albumDetectado = partes[1].trim();
              }
              return (
                <div key={cancion.id || index} className="playlist-track-row">
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
                  <div className="playlist-meta-container">
                    <span className="playlist-track-name">{tituloLimpio}</span>
                    <span className="playlist-artist-name">{cancion.artist}</span>
                  </div>
                  <span className="playlist-album-name">{albumDetectado}</span>
                  <span className="playlist-track-duration">
                    {cancion.duration 
                      ? `${Math.floor(cancion.duration / 60)}:${(cancion.duration % 60).toString().padStart(2, '0')}`
                      : "0:00"
                    }
                  </span>
                  <button
                    className="playlist-delete-btn"
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de que querés eliminar esta canción?")) {
                        eliminarCancion(cancion.id);
                      }
                    }}
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

export default Favorites;