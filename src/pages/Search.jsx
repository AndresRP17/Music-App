import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Agregamos useNavigate
import './Search.css';

function Search() {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [albumes, setAlbumes] = useState([]);
  const [orden, setOrden] = useState('popular');
  const navigate = useNavigate(); 

  // Cargar el historial apenas abre la página
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    setHistorial(guardados);
  }, []);

  // 2. Función para guardar en historial y navegar
  const manejarClickAlbum = (album) => {
    const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
    
    const historialActual = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    
    const itemHistorial = {
        name: album.name,
        artist: nombreArtista,
        image: album.image
    };

    const nuevoHistorial = [
      itemHistorial,
      ...historialActual.filter(item => item.name !== album.name)
    ].slice(0, 5);

    localStorage.setItem('historialBusqueda', JSON.stringify(nuevoHistorial));
    
    // Navegamos al detalle
    navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
  };

  // 3. Lógica de búsqueda con Debounce (500ms)
  useEffect(() => {
    const buscar = async () => {
      if (busqueda.trim().length > 2) {
        try {
          const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(busqueda)}&api_key=aa182e9e95ab101a5f7ae68eba441e09&format=json&limit=40`
          );
          const data = await response.json();

          if (data.topalbums && data.topalbums.album) {
            const listaRaw = data.topalbums.album;
            const nombresVistos = new Set();
            
            let resultados = listaRaw.filter(album => {
              const nombreLimpio = album.name
                .toLowerCase()
                .replace(/remastered|Remaster|deluxe|edition|anniversary|version/g, "")
                .trim();

              if (!nombresVistos.has(nombreLimpio)) {
                nombresVistos.add(nombreLimpio);
                return true;
              }
              return false;
            });

            if (orden === 'az') {
              resultados.sort((a, b) => a.name.localeCompare(b.name));
            }

            setAlbumes(resultados.slice(0, 15));
          }
        } catch (error) {
          console.error("Error conectando con la API:", error);
        }
      } else {
        setAlbumes([]);
      }
    };

    const timeoutId = setTimeout(buscar, 500);
    return () => clearTimeout(timeoutId);
  }, [busqueda, orden]);

  return (
    <div className="content">
      <main className="main-header">
        <div className="maina">
          <h1>Bienvenido, Andrés. ¿Qué vas a escuchar hoy?</h1>
        </div>
      </main>

      <div className="search-section">
        <h1>Buscar álbumes</h1>
        <input 
          className="search-input"
          type="text" 
          placeholder="Escribí el nombre de una banda (ej: AC/DC)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* --- SECCIÓN HISTORIAL (Solo si no hay búsqueda) --- */}
      {busqueda.length === 0 && (
        <div className="historial-section">
          {historial.length > 0 ? (
            <>
              <h2>Buscado recientemente</h2>
              <div className="album-grid">
                {historial.map((album, index) => (
                  <div key={index} className="album-card" onClick={() => manejarClickAlbum(album)}>
                    <img 
                      src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} 
                      alt={album.name} 
                    />
                    <h3>{album.name}</h3>
                    <p>{album.artist}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-history">
              <h2>¿No sabés qué escuchar?</h2>
              
            </div>
          )}
        </div>
      )}

      {/* --- RESULTADOS DE BÚSQUEDA --- */}
      {busqueda.length > 0 && (
        <>
          <div className="filter-bar">
            <span>{albumes.length} álbumes encontrados</span>
            <select 
              className="sort-select" 
              value={orden} 
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="popular">Más populares</option>
              <option value="az">A - Z</option>
            </select>
          </div>

          <div className="album-grid">
            {albumes.map((album, index) => {
              const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
              return (
                <div 
                  key={`${album.name}-${index}`} 
                  className="album-link"
                  onClick={() => manejarClickAlbum(album)}
                  style={{cursor: 'pointer'}}
                >
                  <div className="album-card">
                    <img 
                      src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} 
                      alt={album.name} 
                    />
                    <h3>{album.name}</h3>
                    <p>{nombreArtista}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Search;