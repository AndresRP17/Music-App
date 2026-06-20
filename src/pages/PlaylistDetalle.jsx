import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { FaPlay, FaSearch } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import Publicidad from './Publicidad';
import './Favorites.css';

const esProd = window.location.hostname.includes("netlify");

const PlaylistDetalle = ({ setTrackActual }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canciones, setCanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombrePlaylist, setNombrePlaylist] = useState('');
  const [trackCargando, setTrackCargando] = useState(null);
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const obtenerDatos = async () => {
      if (esProd) {
        const playlists = JSON.parse(localStorage.getItem('playlists') || '[]');
        const playlist = playlists.find(p => p.id == id);
        if (playlist) setNombrePlaylist(playlist.name);
        const songs = JSON.parse(localStorage.getItem(`playlist_songs_${id}`) || '[]');
        setCanciones(songs);
        setCargando(false);
        return;
      }

      try {
        const resPlaylist = await fetch(`/api/playlists/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resPlaylist.ok) {
          const dataPlaylist = await resPlaylist.json();
          setNombrePlaylist(dataPlaylist.name);
        }

        const resCanciones = await fetch(`/api/playlist_songs/playlist/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resCanciones.ok) {
          const dataCanciones = await resCanciones.json();
          setCanciones(dataCanciones);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, [id]);

  const cancionesFiltradas = canciones.filter(cancion => {
    const query = busqueda.toLowerCase();
    return (
      cancion.title?.toLowerCase().includes(query) ||
      cancion.artist?.toLowerCase().includes(query) ||
      cancion.album?.toLowerCase().includes(query)
    );
  });

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
        alert(`No se encontró vista previa para "${cancion.title}"`);
      }
    } catch (error) {
      console.error("Error consultando Deezer:", error);
    } finally {
      setTrackCargando(null);
    }
  };

  const eliminarCancion = async (idCancion) => {
    if (!window.confirm('¿Eliminar esta canción de la playlist?')) return;

    if (esProd) {
      const songs = JSON.parse(localStorage.getItem(`playlist_songs_${id}`) || '[]');
      const nuevas = songs.filter(c => c.id !== idCancion);
      localStorage.setItem(`playlist_songs_${id}`, JSON.stringify(nuevas));
      setCanciones(nuevas);
      return;
    }

    try {
      const response = await fetch(`/api/playlist_songs/${idCancion}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCanciones(prev => prev.filter(c => c.id !== idCancion));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (cargando) return (
    <div className="playlist-loading-view">
      <p>Cargando playlist...</p>
    </div>
  );

  return (
    <div className="playlist-container">
      {mostrarPublicidad && <Publicidad onCerrar={() => setMostrarPublicidad(false)} />}

      <header className="playlist-header" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/mi-musica')}
          style={{ background: 'transparent', border: 'none', color: '#ff2d55', cursor: 'pointer', fontSize: '24px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <IoArrowBack />
        </button>
        <div>
          <p style={{ margin: 0, fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Playlist</p>
          <h1 style={{ margin: '4px 0' }}>{nombrePlaylist}</h1>
          <p className="playlist-subtitle">{canciones.length} canciones</p>
        </div>
      </header>

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

      {cancionesFiltradas.length === 0 ? (
        <div className="playlist-no-songs">
          <h2>No hay canciones en esta playlist</h2>
          <p>Agregá canciones desde el buscador</p>
        </div>
      ) : (
        <div className="playlist-tracklist-section">
          <div className="playlist-tracklist-header">
            <span>#</span>
            <span>Título</span>
            <span>Álbum</span>
            <span>Duración</span>
            <span></span>
          </div>
          <hr />
          <div className="tracklist">
            {cancionesFiltradas.map((cancion, index) => (
              <div key={cancion.id} className="playlist-track-row">
                <div className="playlist-track-number-wrapper">
                  <span className="playlist-track-number">{index + 1}</span>
                  <button
                    className="playlist-play-row-btn"
                    onClick={() => reproducirPista(cancion, index)}
                    disabled={trackCargando === index}
                  >
                    {trackCargando === index
                      ? <span className="mini-spinner">...</span>
                      : <FaPlay style={{ fontSize: '11px', marginLeft: '1px' }} />
                    }
                  </button>
                </div>
                <div className="playlist-meta-container">
                  <span className="playlist-track-name">{cancion.title}</span>
                  <span className="playlist-artist-name">{cancion.artist}</span>
                </div>
                <span className="playlist-album-name">{cancion.album || '—'}</span>
                <span className="playlist-track-duration">
                  {cancion.duration
                    ? `${Math.floor(cancion.duration / 60)}:${(cancion.duration % 60).toString().padStart(2, '0')}`
                    : '0:00'}
                </span>
                <button className="playlist-delete-btn" onClick={() => eliminarCancion(cancion.id)}>
                  <MdDelete />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistDetalle;