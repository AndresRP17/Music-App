/* eslint-disable */

import { useState, useEffect } from 'react';
import { MdDelete } from 'react-icons/md';
import { FaPlus } from 'react-icons/fa';
import { FiMusic } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';


const esProd = window.location.hostname.includes("netlify");

const COLORES = [
  '#e13300', '#1db954', '#2d46b9', '#e91429',
  '#8400e7', '#e8115b', '#006450', '#477d95',
  '#e3670e', '#148a08', '#503750', '#355a38',
];

const getColor = (id) => COLORES[id % COLORES.length];

const MisPlaylists = () => {
  // 🌟 PASO 1: AGREGAMOS EL ESTADO DEL ROL LEYENDO DESDE EL STORAGE
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  const [playlists, setPlaylists] = useState([]);
  const [cantidadCanciones, setCantidadCanciones] = useState({});
  const [cargando, setCargando] = useState(true);
  const [nombreNueva, setNombreNueva] = useState('');
  const [creando, setCreando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('id');

  // 🌟 PASO 2: AGREGAMOS EL ESCUCHADOR PARA LOS CAMBIOS EN TIEMPO REAL
  useEffect(() => {
    const handleRolActualizado = () => {
      setRole(localStorage.getItem("role") || "user");
    };
    window.addEventListener("rolActualizado", handleRolActualizado);
    return () => window.removeEventListener("rolActualizado", handleRolActualizado);
  }, []);

  // Variable corta para meter en los estilos
  const esPremium = role === "premium" || role === "admin";

  const obtenerCantidadesProd = (listas) => {
    const counts = {};
    for (const pl of listas) {
      const songs = JSON.parse(localStorage.getItem(`playlist_songs_${pl.id}`) || '[]');
      counts[pl.id] = songs.length;
    }
    setCantidadCanciones(counts);
  };

  const obtenerCantidadesApi = async (listas) => {
    const results = await Promise.all(
      listas.map(async (pl) => {
        try {
          const r = await fetch(`/api/playlist_songs/playlist/${pl.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!r.ok) return { id: pl.id, count: 0 };
          const songs = await r.json();
          return { id: pl.id, count: Array.isArray(songs) ? songs.length : 0 };
        } catch {
          return { id: pl.id, count: 0 };
        }
      })
    );
    const counts = {};
    results.forEach(({ id, count }) => { counts[id] = count; });
    setCantidadCanciones(counts);
  };

  const obtenerPlaylists = async () => {
    // Forzamos un re-chequeo rápido del storage al arrancar la carga
    setRole(localStorage.getItem("role") || "user");

    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem('playlists') || '[]');
      setPlaylists(guardadas);
      obtenerCantidadesProd(guardadas);
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
        obtenerCantidadesApi(data);
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
      localStorage.setItem('playlists', JSON.stringify([...guardadas, nueva]));
      setPlaylists([...guardadas, nueva]);
      setCantidadCanciones(prev => ({ ...prev, [nueva.id]: 0 }));
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

  const eliminarPlaylist = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar esta playlist?')) return;

    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem('playlists') || '[]');
      const nuevas = guardadas.filter(p => p.id !== id);
      localStorage.setItem('playlists', JSON.stringify(nuevas));
      localStorage.removeItem(`playlist_songs_${id}`);
      setPlaylists(nuevas);
      setCantidadCanciones(prev => { const n = { ...prev }; delete n[id]; return n; });
      return;
    }

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPlaylists(prev => prev.filter(p => p.id !== id));
        setCantidadCanciones(prev => { const n = { ...prev }; delete n[id]; return n; });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

 if (cargando) {
  const role = localStorage.getItem("role") || "user";
  const esPremium = role === "premium" || role === "admin";

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.4rem', fontWeight: 600, background: '#121212' }}>
      {/* 🌟 CAMBIO ACÁ: Color dinámico directo en el estilo del párrafo */}
      <p style={{ color: esPremium ? '#d0b412' : '#fff', margin: 0 }}>
        Cargando playlist...
      </p>
    </div>
  );
}


  return (
    <div style={{ padding: '40px', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
<h1 
  style={{ 
    fontSize: '2.8rem', 
    fontWeight: 700, 
    margin: 0,
    // 🌟 SI ES PREMIUM SE PONE DORADO, SINO MANTIENE SU COLOR ROSA ORIGINAL
    color: role === "premium" || role === "admin" ? '#d0b412' : '#ff2d55' 
  }}
>
  Mis Playlists 
</h1>          <p style={{ color: '#f1ebeb', margin: '8px 0 0', fontSize: '1rem' }}>Tu colección de playlists personalizadas</p>
        </div>
       <button
  onClick={() => esPremium && setCreando(!creando)}
  disabled={!esPremium}
  style={{ 
    display: 'flex', 
    alignItems: 'center', 
    margin: '10px', 
    gap: '8px', 
    background: esPremium ? '#d0b412' : '#555', // Gris si no es premium
    border: 'none', 
    borderRadius: '20px', 
    color: esPremium ? '#fff' : '#aaa', 
    padding: '12px 22px', 
    cursor: esPremium ? 'pointer' : 'not-allowed', // Cambia el cursor a prohibido
    fontWeight: 700, 
    fontSize: '14px', 
    flexShrink: 0 
  }}
>
  <FaPlus /> Nueva Playlist {!esPremium && "🔒"}
</button>
      </div>

      {/* Formulario crear */}
      {creando && (
        <div style={{ display: 'flex', gap: '10px', maxWidth: '500px', marginBottom: '32px' }}>
          <input
            type="text"
            placeholder="Nombre de la playlist..."
            value={nombreNueva}
            onChange={(e) => setNombreNueva(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && crearPlaylist()}
            autoFocus
            style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '14px', outline: 'none' }}
          />
          <button onClick={crearPlaylist} style={{ background: '#1db954', border: 'none', borderRadius: '8px', color: '#fff', padding: '12px 20px', cursor: 'pointer', fontWeight: 700 }}>
            Crear
          </button>
          <button onClick={() => setCreando(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: '8px', color: '#aaa', padding: '12px 20px', cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      )}

    {/* Cards */}
      {playlists.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '80px', color: '#aaa' }}>
          <FiMusic style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }} />
          <h2 style={{ color: '#fff', marginBottom: '8px' }}>No tenés playlists todavía</h2>
          <p>Creá una nueva playlist para empezar a agregar canciones</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
          {playlists.map((playlist) => {
            const count = cantidadCanciones[playlist.id];
            const labelCanciones = count === undefined
              ? '...'
              : count === 0
                ? 'Sin canciones'
                : count === 1
                  ? '1 canción'
                  : `${count} canciones`;

            return (
              <div
                key={playlist.id}
                onClick={() => navigate(`/playlist/${playlist.id}`)}
                style={{ 
                  cursor: 'pointer', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  background: '#181818', 
                  transition: 'transform 0.2s, background 0.2s, border-color 0.2s', 
                  position: 'relative',
                  // 🌟 BORDE DINÁMICO: Si es premium le clava el dorado, si no, un gris oscuro sutil para que mantenga la misma estructura física
                  border: esPremium ? '2px solid #d0b412' : '2px solid transparent',
                  boxShadow: esPremium ? '0 4px 12px rgba(208, 180, 18, 0.15)' : 'none'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#282828';
                  if (esPremium) e.currentTarget.style.boxShadow = '0 4px 16px rgba(208, 180, 18, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#181818';
                  if (esPremium) e.currentTarget.style.boxShadow = '0 4px 12px rgba(208, 180, 18, 0.15)';
                }}
              >
                {/* Parte superior con color e ícono */}
                <div style={{ background: getColor(playlist.id), height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiMusic style={{ fontSize: '52px', color: 'rgba(255,255,255,0.8)' }} />
                </div>

                {/* Info */}
                <div style={{ padding: '12px 14px 14px' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {playlist.name}
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#aaa' }}>
                    {labelCanciones}
                  </p>
                </div>
                {/* Botón eliminar */}
                <button
                  onClick={(e) => eliminarPlaylist(e, playlist.id)}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                  className="delete-playlist-btn"
                >
                  <MdDelete />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPlaylists;