import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaPlay, FaPlus, FaLock, FaCheck } from 'react-icons/fa'; 
import './AlbumDetails.css';
import Publicidad from '../pages/Publicidad';
import ModalPlaylist from '../pages/ModalPlaylist';

const esProd = window.location.hostname.includes("netlify");

function AlbumDetails({ setTrackActual }) {
  const { albumName, artistName } = useParams();
  const [albumInfo, setAlbumInfo] = useState(null);
  const [trackCargando, setTrackCargando] = useState(null); 
  const [cancionesGuardadas, setCancionesGuardadas] = useState([]);
  const [guardandoTrack, setGuardandoTrack] = useState(null);
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [modalPlaylist, setModalPlaylist] = useState(false);
const [cancionSeleccionada, setCancionSeleccionada] = useState(null);

  const esPremium = localStorage.getItem("esPremium") === "true";

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
      // En Netlify: leer del localStorage
      if (esProd) {
        const guardadas = JSON.parse(localStorage.getItem("favoritos") || "[]");
        const claves = guardadas.map(c => `${c.artist}-${c.title}`);
        setCancionesGuardadas(claves);
        return;
      }
      // Local: leer del backend
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/favorites`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) return;
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

    if (!esPremium) {
      const clicks = parseInt(localStorage.getItem('contadorPublicidad')) || 0;
      const siguiente = clicks + 1;
      if (siguiente >= 3) {
        localStorage.setItem('contadorPublicidad', '0');
        setTrackCargando(null);
        setMostrarPublicidad(true);
        return;
      } else {
        localStorage.setItem('contadorPublicidad', siguiente.toString());
      }
    }

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

  const agregarAFavoritos = async (track, index) => {
    if (!esPremium) {
      alert("🔒 Necesitás ser usuario Premium para agregar canciones a tu playlist.");
      return;
    }

    setGuardandoTrack(index);

    // En Netlify: guardar en localStorage
    if (esProd) {
      const guardadas = JSON.parse(localStorage.getItem("favoritos") || "[]");
      const nueva = {
        id: Date.now(),
        title: track.name,
        artist: albumInfo.artist,
        album: albumInfo.name,
        duration: track.duration ? parseInt(track.duration) : 0,
        genre: albumInfo.tags?.tag?.[0]?.name || "Unknown"
      };
      localStorage.setItem("favoritos", JSON.stringify([...guardadas, nueva]));
      setCancionesGuardadas(prev => [...prev, `${albumInfo.artist}-${track.name}`]);
      alert(`¡"${track.name}" se guardó en tus favoritos!`);
      setGuardandoTrack(null);
      return;
    }

    // Local: guardar en el backend
    try {
      const cancionFavorita = {
        title: track.name,
        artist: albumInfo.artist,
        album: albumInfo.name,
        duration: track.duration ? parseInt(track.duration) : 0,
        genre: albumInfo.tags?.tag?.[0]?.name || "Unknown"
      };
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
      setCancionesGuardadas(prev => [...prev, `${albumInfo.artist}-${track.name}`]);
      alert(`¡"${track.name}" se guardó en tus favoritos!`);
    } catch (error) {
      console.error("Error al conectar con el backend:", error);
      alert("Hubo un error de red al intentar guardar la canción.");
    } finally {
      setGuardandoTrack(null);
    }
  };

  if (!albumInfo) return <div className="loading">Cargando...</div>;

  return (
    <div className="album-detail-container">

      {mostrarPublicidad && (
        <Publicidad onCerrar={() => setMostrarPublicidad(false)} />
      )}

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
              albumInfo.tracks.track.map((track, index) => {
                const yaGuardada = cancionesGuardadas.includes(`${albumInfo.artist}-${track.name}`);
                const cargando = guardandoTrack === index;

                return (
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
  className={`add-playlist-btn ${!esPremium ? 'add-playlist-btn--locked' : ''}`}
  onClick={() => {
    if (!esPremium) {
      alert("🔒 Necesitás ser usuario Premium para agregar canciones.");
      return;
    }
    setCancionSeleccionada({
      title: track.name,
      artist: albumInfo.artist,
      album: albumInfo.name,
      duration: track.duration ? parseInt(track.duration) : 0,
      genre: albumInfo.tags?.tag?.[0]?.name || ''
    });
    setModalPlaylist(true);
  }}
  disabled={cargando}
  title={!esPremium ? "Función exclusiva Premium" : "Agregar a playlist"}
>
  {cargando ? (
    <span className="mini-spinner">...</span>
  ) : !esPremium ? (
    <FaLock />
  ) : (
    <FaPlus />
  )}
</button>
{modalPlaylist && cancionSeleccionada && (
  <ModalPlaylist
    cancion={cancionSeleccionada}
    onCerrar={() => {
      setModalPlaylist(false);
      setCancionSeleccionada(null);
    }}
  />
)}
                  </div>
                );
              })
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