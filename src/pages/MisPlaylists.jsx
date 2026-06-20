import { useState, useEffect } from 'react';
import { MdDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Favorites.css';

const esProd = window.location.hostname.includes("netlify");

const MisPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNueva, setNombreNueva] = useState('');
  const [creando, setCreando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('id');

  const obtenerPlaylists = async () => {
    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem('playlists') || '[]');
      setPlaylists(guardadas);
      setCargando(false);
      return;
    }
    try {
      const response = await fetch('/api/playlists', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerPlaylists();
  }, []);

  const crearPlaylist = async () => {
    if (!nombreNueva.trim()) return;

    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem('playlists') || '[]');
      const nueva = { id: Date.now(), name: nombreNueva };
      const nuevas = [...guardadas, nueva];
      localStorage.setItem('playlists', JSON.stringify(nuevas));
      setPlaylists(nuevas);
      setNombreNueva('');
      setCreando(false);
      return;
    }

    try {
      const response = await fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id_user: userId, name: nombreNueva })
      });
      if (response.ok) {
        setNombreNueva('');
        setCreando(false);
        obtenerPlaylists();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const eliminarPlaylist = async (id) => {
    if (!window.confirm('¿Eliminar esta playlist?')) return;

    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem('playlists') || '[]');
      const nuevas = guardadas.filter(p => p.id !== id);
      localStorage.setItem('playlists', JSON.stringify(nuevas));
      localStorage.removeItem(`playlist_songs_${id}`);
      setPlaylists(nuevas);
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (cargando) return (
    <div className="playlist-loading-view">
      <p>Cargando playlists...</p>
    </div>
  );

  return (
    <div className="playlist-container">
      <header className="playlist-header">
        <h1>Mis Playlists</h1>
        <p className="playlist-subtitle">Tu colección de playlists personalizadas</p>
      </header>

      <div style={{ marginBottom: '24px' }}>
        {creando ? (
          <div style={{ display: 'flex', gap: '10px', maxWidth: '500px' }}>
            <input
              type="text"
              placeholder="Nombre de la playlist..."
              value={nombreNueva}
              onChange={(e) => setNombreNueva(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && crearPlaylist()}
              autoFocus
              style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '14px' }}
            />
            <button onClick={crearPlaylist} style={{ background: '#1db954', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', cursor: 'pointer', fontWeight: 600 }}>
              Crear
            </button>
            <button onClick={() => setCreando(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: '8px', color: '#aaa', padding: '10px 20px', cursor: 'pointer' }}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreando(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1db954', border: 'none', borderRadius: '20px', color: '#fff', padding: '10px 20px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            <FaPlus /> Nueva Playlist
          </button>
        )}
      </div>

      {playlists.length === 0 ? (
        <div className="playlist-no-songs">
          <h2>No tenés playlists todavía</h2>
          <p>Creá una nueva playlist para empezar a agregar canciones</p>
        </div>
      ) : (
        <div className="playlist-tracklist-section">
          <div className="playlist-tracklist-header">
            <span>#</span>
            <span>Nombre</span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <hr />
          <div className="tracklist">
            {playlists.map((playlist, index) => (
              <div key={playlist.id} className="playlist-track-row">
                <div className="playlist-track-number-wrapper">
                  <span className="playlist-track-number">{index + 1}</span>
                </div>
                <div
                  className="playlist-meta-container"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="playlist-track-name">{playlist.name}</span>
                </div>
                <span></span>
                <span></span>
                <button className="playlist-delete-btn" onClick={() => eliminarPlaylist(playlist.id)}>
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

export default MisPlaylists;
