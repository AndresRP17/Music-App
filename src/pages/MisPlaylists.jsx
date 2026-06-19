import { useState, useEffect } from 'react';
import { MdDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';

const MisPlaylists = () => {
  const [playlists, setPlaylists] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombreNueva, setNombreNueva] = useState('');
  const [creando, setCreando] = useState(false);

  const token = localStorage.getItem('token');

  const obtenerPlaylists = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre: nombreNueva })
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
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/playlists/${id}`, {
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

  if (cargando) return <p style={{ padding: '24px' }}>Cargando playlists...</p>;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Mis Playlists</h1>
        <button
          onClick={() => setCreando(!creando)}
          style={{ background: '#1db954', border: 'none', borderRadius: '20px', color: '#fff', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FaPlus /> Nueva Playlist
        </button>
      </div>

      {/* Formulario crear playlist */}
      {creando && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Nombre de la playlist..."
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && crearPlaylist()}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#222', color: '#fff' }}
          />
          <button
            onClick={crearPlaylist}
            style={{ background: '#1db954', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', cursor: 'pointer' }}
          >
            Crear
          </button>
          <button
            onClick={() => setCreando(false)}
            style={{ background: '#333', border: 'none', borderRadius: '8px', color: '#fff', padding: '10px 20px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Lista de playlists */}
      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '60px', color: '#aaa' }}>
          <h2>No tenés playlists todavía</h2>
          <p>Creá una nueva playlist para empezar a agregar canciones</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {playlists.map(playlist => (
            <div key={playlist.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#181818', borderRadius: '8px', padding: '16px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff' }}>{playlist.nombre}</h3>
              </div>
              <button
                onClick={() => eliminarPlaylist(playlist.id)}
                style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '20px' }}
              >
                <MdDelete />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MisPlaylists;