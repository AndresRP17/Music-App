import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes, FaPlay, FaPlus } from 'react-icons/fa';
import { MdHistory, MdDeleteSweep } from 'react-icons/md';
import ModalPlaylist from './ModalPlaylist';
import Publicidad from '../pages/Publicidad';
import { usePublicidad } from '../hooks/usePublicidad';
import './Search.css';

function Search({ reproducirLista, pausar }) {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [albumes, setAlbumes] = useState([]);
  const [artistas, setArtistas] = useState([]);
  const [canciones, setCanciones] = useState([]);
  const [orden, setOrden] = useState('popular');
  const [tab, setTab] = useState('albumes');
  const [cargando, setCargando] = useState(false);
  const [modalPlaylist, setModalPlaylist] = useState(false);
  const [cancionSeleccionada, setCancionSeleccionada] = useState(null);
  const navigate = useNavigate();
  const { mostrarPublicidad, conPublicidad, cerrarYContinuar } = usePublicidad(pausar);

  const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    setHistorial(guardados);
  }, []);

  const manejarClickAlbum = (album) => {
    const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
    const historialActual = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    const itemHistorial = { name: album.name, artist: nombreArtista, image: album.image };
    const nuevoHistorial = [
      itemHistorial,
      ...historialActual.filter(item => item.name !== album.name)
    ].slice(0, 5);
    localStorage.setItem('historialBusqueda', JSON.stringify(nuevoHistorial));
    conPublicidad(() => {
      navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
    });
  };

  const limpiarHistorial = () => {
    localStorage.removeItem('historialBusqueda');
    setHistorial([]);
  };

  useEffect(() => {
    const buscar = async () => {
      if (busqueda.trim().length > 2) {
        setCargando(true);
        try {
          const resAlbumes = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(busqueda)}&api_key=${API_KEY}&format=json&limit=50`
          );
          const dataAlbumes = await resAlbumes.json();
          if (dataAlbumes.results?.albummatches) {
            const listaRaw = dataAlbumes.results.albummatches.album;
            const nombresVistos = new Set();
            let resultados = listaRaw.filter(album => {
              const nombreLimpio = album.name.toLowerCase()
                .replace(/remastered|remaster|deluxe|edition|anniversary|version|special/g, "").trim();
              const tieneImagen = album.image && album.image[3]['#text'] !== "";
              if (!nombresVistos.has(nombreLimpio) && tieneImagen) {
                nombresVistos.add(nombreLimpio);
                return true;
              }
              return false;
            });
            if (orden === 'az') resultados.sort((a, b) => a.name.localeCompare(b.name));
            setAlbumes(resultados.slice(0, 20));
          }

          const resArtistas = await fetch(`/deezer/search/artist?q=${encodeURIComponent(busqueda)}`);
          const dataArtistas = await resArtistas.json();
          if (dataArtistas.data) setArtistas(dataArtistas.data.slice(0, 12));

          const resCanciones = await fetch(`/deezer/search?q=${encodeURIComponent(busqueda)}`);
          const dataCanciones = await resCanciones.json();
          if (dataCanciones.data) setCanciones(dataCanciones.data.slice(0, 20));

        } catch (error) {
          console.error("Error en la API:", error);
        } finally {
          setCargando(false);
        }
      } else {
        setAlbumes([]);
        setArtistas([]);
        setCanciones([]);
        setCargando(false);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, orden]);

  return (
    <div className="content">
      <main className="main-header">
        <div className="maina">
          <h1>Bienvenida/o. ¿Qué vas a escuchar hoy?</h1>
        </div>
      </main>

      <div className="search-section">
        <h1>Buscar</h1>
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Artistas, álbumes, canciones..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button className="search-clear-btn" onClick={() => setBusqueda('')}>
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {busqueda.length === 0 && (
        <div className="historial-section">
          {historial.length > 0 ? (
            <>
              <div className="historial-header">
                <h2><MdHistory style={{ verticalAlign: 'middle', marginRight: '8px' }} />Buscado recientemente</h2>
                <button className="limpiar-btn" onClick={limpiarHistorial}>
                  <MdDeleteSweep /> Limpiar
                </button>
              </div>
              <div className="album-grid">
                {historial.map((album, index) => (
                  <div key={index} className="album-card" onClick={() => manejarClickAlbum(album)}>
                    <img src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} alt={album.name} />
                    <h3>{album.name}</h3>
                    <p>{album.artist}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-history">
              <FaSearch style={{ fontSize: '48px', opacity: 0.2, marginBottom: '16px' }} />
              <h2>Tu historial está vacío</h2>
              <p>¡Empezá a explorar álbumes y artistas!</p>
            </div>
          )}
        </div>
      )}

      {busqueda.length > 2 && (
        <>
          <div className="search-tabs">
            <button className={`search-tab ${tab === 'albumes' ? 'active' : ''}`} onClick={() => setTab('albumes')}>
              Álbumes {albumes.length > 0 && <span className="tab-count">{albumes.length}</span>}
            </button>
            <button className={`search-tab ${tab === 'artistas' ? 'active' : ''}`} onClick={() => setTab('artistas')}>
              Artistas {artistas.length > 0 && <span className="tab-count">{artistas.length}</span>}
            </button>
            <button className={`search-tab ${tab === 'canciones' ? 'active' : ''}`} onClick={() => setTab('canciones')}>
              Canciones {canciones.length > 0 && <span className="tab-count">{canciones.length}</span>}
            </button>
          </div>

          {cargando ? (
            <div className="album-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-img" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line short" />
                </div>
              ))}
            </div>

          ) : tab === 'albumes' ? (
            <>
              <div className="filter-bar">
                <select className="sort-select" value={orden} onChange={(e) => setOrden(e.target.value)}>
                  <option value="popular">Relevancia</option>
                  <option value="az">A - Z</option>
                </select>
              </div>
              <div className="album-grid">
                {albumes.map((album, index) => {
                  const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
                  return (
                    <div key={`${album.name}-${index}`} className="album-card" onClick={() => manejarClickAlbum(album)}>
                      <img src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} alt={album.name} />
                      <h3>{album.name}</h3>
                      <p
                        onClick={(e) => { e.stopPropagation(); navigate(`/artist/${encodeURIComponent(nombreArtista)}`); }}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={e => e.target.style.color = '#fff'}
                        onMouseLeave={e => e.target.style.color = '#b3b3b3'}
                      >
                        {nombreArtista}
                      </p>
                    </div>
                  );
                })}
              </div>
            </>

          ) : tab === 'artistas' ? (
            <div className="artistas-grid">
              {artistas.length === 0 ? (
                <p style={{ color: '#aaa', padding: '20px 0' }}>No se encontraron artistas.</p>
              ) : (
                artistas.map((artista, index) => (
                  <div key={index} className="artista-card" onClick={() => navigate(`/artist/${encodeURIComponent(artista.name)}`)}>
                    <img
                      src={artista.picture_xl || artista.picture_medium || 'https://via.placeholder.com/200'}
                      alt={artista.name}
                    />
                    <h3>{artista.name}</h3>
                    <p>{parseInt(artista.nb_fan || 0).toLocaleString()} fans</p>
                  </div>
                ))
              )}
            </div>

          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
              {canciones.length === 0 ? (
                <p style={{ color: '#aaa', padding: '20px 0' }}>No se encontraron canciones.</p>
              ) : (
                canciones.map((cancion, index) => (
                  <div
                    key={cancion.id}
                    style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto', gap: '12px', padding: '8px 12px', borderRadius: '8px', alignItems: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <img
                      src={cancion.album?.cover_small || 'https://via.placeholder.com/48'}
                      alt={cancion.title}
                      style={{ width: '48px', height: '48px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{cancion.title}</div>
                      <div style={{ color: '#aaa', fontSize: '12px' }}>
                        <span
                          onClick={() => navigate(`/artist/${encodeURIComponent(cancion.artist.name)}`)}
                          style={{ cursor: 'pointer' }}
                          onMouseEnter={e => e.target.style.color = '#fff'}
                          onMouseLeave={e => e.target.style.color = '#aaa'}
                        >
                          {cancion.artist.name}
                        </span>
                        {cancion.album?.title && <span> · {cancion.album.title}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: '#aaa', fontSize: '13px' }}>
                        {Math.floor(cancion.duration / 60)}:{(cancion.duration % 60).toString().padStart(2, '0')}
                      </span>
                      <button
                        onClick={() => {
                          const lista = canciones.map(c => ({
                            title: c.title,
                            artist: c.artist.name,
                            url: c.preview,
                            cover: c.album?.cover_medium || 'https://via.placeholder.com/150'
                          }));
                          conPublicidad(() => reproducirLista(lista, index));
                        }}
                        style={{ background: '#b80f0f', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}
                      >
                        <FaPlay style={{ fontSize: '11px', marginLeft: '1px' }} />
                      </button>
                      <button
                        onClick={() => {
                          setCancionSeleccionada({
                            title: cancion.title,
                            artist: cancion.artist.name,
                            album: cancion.album?.title || '',
                            duration: cancion.duration || 0,
                            genre: ''
                          });
                          setModalPlaylist(true);
                        }}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#aaa', flexShrink: 0 }}
                      >
                        <FaPlus style={{ fontSize: '11px' }} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {modalPlaylist && cancionSeleccionada && (
        <ModalPlaylist
          cancion={cancionSeleccionada}
          onCerrar={() => { setModalPlaylist(false); setCancionSeleccionada(null); }}
        />
      )}

      {mostrarPublicidad && (
        <Publicidad onCerrar={cerrarYContinuar} />
      )}
    </div>
  );
}

export default Search;