import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPlus } from 'react-icons/fa'; 
import './AlbumDetails.css';


function AlbumDetails({ setTrackActual }) {
  const { albumName, artistName } = useParams();
  const [albumInfo, setAlbumInfo] = useState(null);
  const [trackCargando, setTrackCargando] = useState(null); 
  const [cancionesGuardadas, setCancionesGuardadas] = useState([]);
  const [guardandoTrack, setGuardandoTrack] = useState(null);

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        const nombreLimpio = artistName.toUpperCase().replace(/[\s/]/g, "");
        
        let artistaParaLastFm = artistName;

        if (nombreLimpio === "ACDC") {
          artistaParaLastFm = "AC/DC"; 
        }

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


  useEffect(() => {
  const obtenerFavoritos = async () => {
    try {
      const token = localStorage.getItem('token'); // 👈 agregás el token

      const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}` // 👈 lo mandás en el header
        }
      });

      if (!response.ok) return; // 👈 si falla, no intentes hacer .map()

      const data = await response.json();
      const canciones = data.map(c => `${c.artist}-${c.title}`);
      setCancionesGuardadas(canciones);
    } catch (error) {
      console.error(error);
    }
  };
  obtenerFavoritos();
}, []);

  const reproducirPista = async (trackName, index) => {
    setTrackCargando(index); 
    
    try {
      const trackLimpio = trackName.replace(/[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/g, "").trim();
      const query = `${albumInfo.artist} ${trackLimpio}`;
      
      const response = await fetch(`/deezer/search?q=${encodeURIComponent(query)}`);
      const data = await response.json(); 

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
  }; 

  if (!albumInfo) return <div className="loading">Cargando...</div>;

  const agregarAFavoritos = async (track, index) => {
    setGuardandoTrack(index);

    try {
      const cancionFavorita = {
        title: track.name,
        artist: albumInfo.artist,
        album: albumInfo.name,
        duration: track.duration ? parseInt(track.duration) : 0,
        genre: albumInfo.tags?.tag?.[0]?.name || "Unknown"
      };

      // 🚀 1. Capturamos el token que guardaste al iniciar sesión
      const token = localStorage.getItem('token'); 

      const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cancionFavorita)
      });

      if (!response.ok) {
        const textoError = await response.text();
        console.error("El servidor respondió con error:", textoError);
        alert("Error al guardar la canción.");
        return;
      }

      await response.json();

      setCancionesGuardadas(prev => [
        ...prev,
        `${albumInfo.artist}-${track.name}`
      ]);

      alert(`¡"${track.name}" se guardó en tus favoritos!`);

    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("Hubo un error de red al intentar guardar la canción.");
    } finally {
      setGuardandoTrack(null);
    }
  };

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
                  
                  <span className="track-name">{track.name}</span>
                  
                  <span className="track-duration">
                    {track.duration 
                      ? `${Math.floor(track.duration / 60)}:${(track.duration % 60).toString().padStart(2, '0')}`
                      : "0:00"
                    }
                  </span>

                  <button 
                    className="add-playlist-btn"
                    onClick={() => agregarAFavoritos(track, index)}
                    disabled={
                      guardandoTrack === index || 
                      cancionesGuardadas.includes(`${albumInfo.artist}-${track.name}`)
                    }
                    title="Agregar a la playlist"
                  >
                    {guardandoTrack === index ? (
                      <span className="mini-spinner">...</span>
                    ) : cancionesGuardadas.includes(`${albumInfo.artist}-${track.name}`) ? (
                      
                      "✓"
                    ) : (
                      <FaPlus />
                    )}
                  </button>

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
} 

export default AlbumDetails;
