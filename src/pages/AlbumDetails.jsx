import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa'; 
import './AlbumDetails.css';

function AlbumDetail({ setTrackActual }) {
  const { albumName, artistName } = useParams();
  const [albumInfo, setAlbumInfo] = useState(null);
  const [trackCargando, setTrackCargando] = useState(null); 

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        // 1. Normalizamos el nombre: le sacamos los espacios y barras para comparar
        const nombreLimpio = artistName.toUpperCase().replace(/[\s/]/g, "");
        
        let artistaParaLastFm = artistName;

        // 2. Si el usuario buscó "ACDC" o "AC/DC", forzamos el formato que Last.fm ama
        if (nombreLimpio === "ACDC") {
          artistaParaLastFm = "AC/DC"; 
        }

        // 3. Hacemos el fetch con el nombre que Last.fm sí entiende
        const response = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=aa182e9e95ab101a5f7ae68eba441e09&artist=${encodeURIComponent(artistaParaLastFm)}&album=${encodeURIComponent(albumName)}&format=json&autocorrect=1`
        );      
        const data = await response.json();
        
        if (data.album) {
          setAlbumInfo(data.album);
        } else {
          console.warn("Last.fm no encontró el álbum con ese formato de nombre.");
        }
      } catch (error) {
        console.error("Error al traer el detalle:", error);
      }
    };
    
    if (artistName && albumName) {
      fetchAlbumDetails();
    }
  }, [albumName, artistName]);

  // ==========================================
  // ¡EL PUENTE CON DEEZER CORREGIDO CON PROXY Y FILTRO DE CARACTERES!
  // ==========================================
  const reproducirPista = async (trackName, index) => {
    setTrackCargando(index); 
    
    try {
      // 1. FILTRO DE CARACTERES ASIÁTICOS
      const trackLimpio = trackName.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/g, "").trim();

      // 2. Armamos la consulta
      const query = `${albumInfo.artist} ${trackLimpio}`;
      
      // 3. 🚀 EL CAMBIO CLAVE: Le pegamos a nuestra propia ruta local de Netlify
      const response = await fetch(`/deezer/search?q=${encodeURIComponent(query)}`);
      const data = await response.json(); 

      // 4. Si Deezer encontró la canción...
      if (data.data && data.data.length > 0) {
        const trackEncontrado = data.data[0]; 
        const portadaLastFm = albumInfo.image?.[2]?.['#text'] || 'https://via.placeholder.com/150';

        setTrackActual({
          title: trackLimpio,
          artist: albumInfo.artist,
          url: trackEncontrado.preview, 
          cover: trackEncontrado.album?.cover_medium || portadaLastFm 
        });
      } else {
        alert(`No se encontró una vista previa de audio para "${trackLimpio}" en Deezer.`);
      }
    } catch (error) {
      console.error("Error buscando en la API de Deezer:", error);
      alert("Hubo un error al conectar con el servidor de audio.");
    } finally {
      setTrackCargando(null); 
    }
  }; // <--- AQUÍ FALTABA ESTE CIERRE DE LA FUNCIÓN reproducirPista

  if (!albumInfo) return <div className="loading">Cargando...</div>;

  return (
    <div className="album-detail-container">
      <header className="album-header">
        <img 
          src={albumInfo.image?.[3]?.['#text'] || 'https://via.placeholder.com/300'} 
          alt={albumInfo.name} 
          className="detail-cover"
        />
        <div className="header-info">
          <p className="type">Álbum</p>
          <h1>{albumInfo.name}</h1>
          <div className="album-metadata">
            <span className="artist-name-main">{albumInfo.artist}</span>
            {albumInfo.tags?.tag?.length > 0 && (
              <span className="genre-tag"> • {albumInfo.tags.tag[0].name}</span>
            )}
          </div>
        </div>
      </header>

      <div className="detail-layout">
        <section className="tracklist-section">
          <div className="tracklist-header">
            <span>#</span>
            <span>Título</span>
            <span className="text-right">Duración</span>
          </div>
          <hr />
          <div className="tracklist">
            {albumInfo.tracks?.track ? (
              albumInfo.tracks.track.map((track, index) => (
                <div key={index} className="track-row">
                  
                  {/* 1. COLUMNA NÚMERO Y PLAY UNIFICADOS */}
                  <div className="track-number-wrapper">
                    <span className="track-number">{index + 1}</span>
                    <button 
                      className="play-row-btn" 
                      onClick={() => reproducirPista(track.name, index)}
                      disabled={trackCargando === index}
                    >
                      {trackCargando === index ? (
                        <span className="mini-spinner">...</span>
                      ) : (
                        <FaPlay />
                      )}
                    </button>
                  </div>
                  
                  {/* 2. COLUMNA TÍTULO */}
                  <span className="track-name">{track.name}</span>
                  
                  {/* 3. COLUMNA DURACIÓN */}
                  <span className="track-duration">
                    {track.duration 
                      ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                      : "0:00"
                    }
                  </span>

                </div>
              ))
            ) : (
              <p className="no-tracks">No se encontraron canciones para este álbum.</p>
            )}
          </div>
        </section>

        <aside className="album-sidebar">
          {albumInfo.wiki ? (
            <div className="wiki-card">
              <h3>Sobre el álbum</h3>
              <p className="wiki-text">
                {albumInfo.wiki.summary.split('<a href')[0]}
              </p>
            </div>
          ) : (
            <div className="wiki-card">
              <p className="no-wiki">No hay descripción disponible.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
} // <--- Cierre correcto de la función AlbumDetail

export default AlbumDetail;