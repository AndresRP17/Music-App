import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Search.css';

function Search() {
  const [busqueda, setBusqueda] = useState('');
  const [albumes, setAlbumes] = useState([]);
  const [orden, setOrden] = useState('popular'); // Estado para el select
  // ... arriba con tus otros estados

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
            
            // 1. Filtramos duplicados (Remasters, Deluxe, etc)
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

            // 2. Aplicamos el orden según el Select
            if (orden === 'az') {
              resultados.sort((a, b) => a.name.localeCompare(b.name));
            }

            setAlbumes(resultados.slice(0, 15)); // Mostramos un top 15 limpio
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
  }, [busqueda, orden]); // Se dispara si cambia la búsqueda O el orden

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
            <Link 
              key={`${album.name}-${index}`} 
              to={`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`} 
              className="album-link"
            >
              <div className="album-card">
                <img 
                  src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} 
                  alt={album.name} 
                />
                <h3>{album.name}</h3>
                <p>{nombreArtista}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Search;