import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Search.css';

function Search() {
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [albumes, setAlbumes] = useState([]);
  const [orden, setOrden] = useState('popular');
  const navigate = useNavigate(); 

  const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

  // 1. Cargar historial del localStorage
  useEffect(() => {
    const guardados = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    setHistorial(guardados);
  }, []);

  // 2. Guardar en historial y navegar al detalle
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
    navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
  };

  // 3. Lógica de búsqueda con Debounce y Filtros
  useEffect(() => {
    const buscar = async () => {
      if (busqueda.trim().length > 2) {
        try {
          // Usamos album.search para que encuentre coincidencias más amplias
          const response = await fetch(
            `https://ws.audioscrobbler.com/2.0/?method=album.search&album=${encodeURIComponent(busqueda)}&api_key=${API_KEY}&format=json&limit=50`
          );
          const data = await response.json();

          if (data.results && data.results.albummatches) {
            const listaRaw = data.results.albummatches.album;
            const nombresVistos = new Set();
            
            let resultados = listaRaw.filter(album => {
              // Normalizamos el nombre para evitar duplicados (Remaster, Deluxe, etc)
              const nombreLimpio = album.name
                .toLowerCase()
                .replace(/remastered|remaster|deluxe|edition|anniversary|version|special/g, "")
                .trim();

              // Solo permitimos álbumes con imagen y que no hayamos procesado ya
              const tieneImagen = album.image && album.image[3]['#text'] !== "";
              
              if (!nombresVistos.has(nombreLimpio) && tieneImagen) {
                nombresVistos.add(nombreLimpio);
                return true;
              }
              return false;
            });

            // Ordenamiento
            if (orden === 'az') {
              resultados.sort((a, b) => a.name.localeCompare(b.name));
            }

            setAlbumes(resultados.slice(0, 20));
          }
        } catch (error) {
          console.error("Error en la API:", error);
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
          placeholder="Buscá por álbum o banda (ej: After Hours o AC/DC)..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* --- SECCIÓN HISTORIAL --- */}
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
              <h2>Tu historial está vacío. ¡Empezá a explorar!</h2>
            </div>
          )}
        </div>
      )}

      {/* --- RESULTADOS DE BÚSQUEDA --- */}
      {busqueda.length > 0 && (
        <>
          <div className="filter-bar">
            <span>{albumes.length} resultados encontrados</span>
            <select 
              className="sort-select" 
              value={orden} 
              onChange={(e) => setOrden(e.target.value)}
            >
              <option value="popular">Relevancia</option>
              <option value="az">A - Z</option>
            </select>
          </div>

          <div className="album-grid">
            {albumes.map((album, index) => {
              const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
              return (
                <div 
                  key={`${album.name}-${index}`} 
                  className="album-card" 
                  onClick={() => manejarClickAlbum(album)}
                >
                  <img 
                    src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} 
                    alt={album.name} 
                  />
                  <h3>{album.name}</h3>
                  <p>{nombreArtista}</p>
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