import { useState, useEffect } from 'react';
import { FaPlus } from 'react-icons/fa';
import { IoIosClose } from 'react-icons/io';
import { FiMusic } from 'react-icons/fi';

const ModalPlaylist = ({ cancion, onCerrar }) => {
  const [playlists, setPlaylists] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [nombreNueva, setNombreNueva] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
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
    obtenerPlaylists();
  }, []);

  const playlistsFiltradas = playlists.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const agregarAPlaylist = async (playlist) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/playlist_songs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_playlist: playlist.id,
          title: cancion.title || cancion.name,
          artist: cancion.artist,
          album: cancion.album || '',
          duration: cancion.duration || 0,
          genre: cancion.genre || ''
        })
      });
      if (response.ok) {
        alert(`"${cancion.title || cancion.name}" agregada a "${playlist.nombre}"`);
        onCerrar();
      } else {
        alert('Error al agregar la canción');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const crearYAgregar = async () => {
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
        const nueva = await response.json();
        await agregarAPlaylist({ id: nueva.id, nombre: nombreNueva });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const agregarAFavoritos = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: cancion.title || cancion.name,
        artist: cancion.artist,
        album: cancion.album || '',
        duration: cancion.duration || 0,
        genre: cancion.genre || ''
      })
    });
    if (response.ok) {
      alert(`"${cancion.title || cancion.name}" agregada a Favoritos`);
      onCerrar();
    } else {
      alert('Error al agregar a favoritos');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

  return (
    <div 
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onCerrar}
    >
      <div 
        style={{ background: 'var(--color-background-primary, #1a1a1a)', borderRadius: '12px', width: '320px', overflow: 'hidden', border: '0.5px solid #333' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderBottom: '0.5px solid #333' }}>
          <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 500, color: '#fff' }}>Agregar a playlist</h2>
          <button onClick={onCerrar} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: '20px', display: 'flex', alignItems: 'center' }}>
            <IoIosClose />
          </button>
        </div>

        {/* Opción favoritos */}
<div
  onClick={() => agregarAFavoritos()}
  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', borderBottom: '0.5px solid #333' }}
  onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
>
  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2a2a2a', border: '0.5px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <span style={{ color: '#e25555', fontSize: '16px' }}>♥</span>
  </div>
  <div style={{ fontSize: '14px', color: '#fff' }}>Agregar a Favoritos</div>
</div>

        {/* Buscador */}
        <div style={{ padding: '10px 16px', borderBottom: '0.5px solid #333' }}>
          <input
            type="text"
            placeholder="Buscar playlist..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '0.5px solid #444', background: '#2a2a2a', color: '#fff' }}
          />
        </div>

        {/* Lista de playlists */}
        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {cargando ? (
            <p style={{ padding: '16px', color: '#aaa', fontSize: '14px' }}>Cargando...</p>
          ) : playlistsFiltradas.length === 0 ? (
            <p style={{ padding: '16px', color: '#aaa', fontSize: '14px' }}>No se encontraron playlists</p>
          ) : (
            playlistsFiltradas.map(playlist => (
              <div
                key={playlist.id}
                onClick={() => agregarAPlaylist(playlist)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2a2a2a'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#2a2a2a', border: '0.5px solid #444', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FiMusic style={{ color: '#aaa', fontSize: '16px' }} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', color: '#fff' }}>{playlist.nombre}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — crear nueva */}
        <div style={{ padding: '10px 16px', borderTop: '0.5px solid #333' }}>
          {creandoNueva ? (
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Nombre de la playlist..."
                value={nombreNueva}
                onChange={e => setNombreNueva(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && crearYAgregar()}
                autoFocus
                style={{ flex: 1, padding: '7px 10px', fontSize: '13px', borderRadius: '8px', border: '0.5px solid #444', background: '#2a2a2a', color: '#fff' }}
              />
              <button onClick={crearYAgregar} style={{ background: '#1db954', border: 'none', borderRadius: '8px', color: '#fff', padding: '7px 12px', cursor: 'pointer', fontSize: '13px' }}>
                Crear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreandoNueva(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#1db954', fontSize: '14px', padding: '4px 0' }}
            >
              <FaPlus style={{ fontSize: '13px' }} /> Crear nueva playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPlaylist;