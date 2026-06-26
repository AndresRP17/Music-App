import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdDelete } from 'react-icons/md';
import { FaPlay, FaSearch } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import Publicidad from './Publicidad';
import { usePublicidad } from '../../hooks/usePublicidad';
import './styles/PlaylistDetalle.css';

const esProd = window.location.hostname.includes("netlify");

const PlaylistDetalle = ({ reproducirLista }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canciones, setCanciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombrePlaylist, setNombrePlaylist] = useState('');
  const [trackCargando, setTrackCargando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const { mostrarPublicidad, conPublicidad, cerrarYContinuar } = usePublicidad(null);
  const token = localStorage.getItem('token');

  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  useEffect(() => {
    const handleRolActualizado = () => {
      setRole(localStorage.getItem("role") || "user");
    };
    window.addEventListener("rolActualizado", handleRolActualizado);
    return () => window.removeEventListener("rolActualizado", handleRolActualizado);
  }, []);

  const esPremium = role === "premium" || role === "admin";

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
    try {
      const listaConUrls = await Promise.all(
        cancionesFiltradas.map(async (c) => {
          try {
            const r = await fetch(`/deezer/search?q=${encodeURIComponent(`${c.artist} ${c.title}`)}`);
            const d = await r.json();
            const track = d.data?.[0];
            return {
              title: c.title,
              artist: c.artist,
              url: track?.preview || null,
              cover: track?.album?.cover_medium || 'https://via.placeholder.com/150'
            };
          } catch {
            return { title: c.title, artist: c.artist, url: null, cover: 'https://via.placeholder.com/150' };
          }
        })
      );
      conPublicidad(() => reproducirLista(listaConUrls, index));
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
    <div className="pd-loading">
      <p style={{ color: esPremium ? '#d0b412' : '' }}>Cargando playlist...</p>
    </div>
  );

  return (
    <div className={`pd-container${esPremium ? ' is-premium' : ''}`}>
      {mostrarPublicidad && <Publicidad onCerrar={cerrarYContinuar} />}

      <header className="pd-header">
        <button className="pd-back-btn" onClick={() => navigate('/mi-musica')}>
          <IoArrowBack />
        </button>
        <div className="pd-header-info">
          <p className="pd-label">Playlist</p>
          <h1 style={{ color: esPremium ? '#d0b412' : '' }}>{nombrePlaylist}</h1>
          <p className="pd-subtitle">{canciones.length} canciones</p>
        </div>
      </header>

      <div className="pd-search-wrapper">
        <FaSearch className="pd-search-icon" />
        <input
          type="text"
          className="pd-search-input"
          placeholder="Buscar por título, artista o álbum..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {cancionesFiltradas.length === 0 ? (
        <div className="pd-no-songs">
          <h2>No hay canciones en esta playlist</h2>
          <p>Agregá canciones desde el buscador</p>
        </div>
      ) : (
        <div className="pd-tracklist-section">
          <div className="pd-tracklist-header">
            <span>#</span>
            <span>Título</span>
            <span>Álbum</span>
            <span>Duración</span>
            <span></span>
          </div>
          <hr />
          <div className="tracklist">
            {cancionesFiltradas.map((cancion, index) => (
              <div key={cancion.id} className="pd-track-row">
                <div className="pd-track-number-wrapper">
                  <span className="pd-track-number">{index + 1}</span>
                  <button
                    className="pd-play-btn"
                    onClick={() => reproducirPista(cancion, index)}
                    disabled={trackCargando === index}
                  >
                    {trackCargando === index
                      ? <span className="mini-spinner">...</span>
                      : <FaPlay style={{ fontSize: '11px', marginLeft: '1px' }} />
                    }
                  </button>
                </div>
                <div className="pd-meta">
                  <span className="pd-track-name">{cancion.title}</span>
                  <span className="pd-artist-name">{cancion.artist}</span>
                </div>
                <span className="pd-album-name">{cancion.album || '—'}</span>
                <span className="pd-duration">
                  {cancion.duration
                    ? `${Math.floor(cancion.duration / 60)}:${(cancion.duration % 60).toString().padStart(2, '0')}`
                    : '0:00'}
                </span>
                <button className="pd-delete-btn" onClick={() => eliminarCancion(cancion.id)}>
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