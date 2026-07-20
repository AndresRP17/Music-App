import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaPlus, FaLock } from "react-icons/fa";
import { usePublicidad } from "../../hooks/usePublicidad";
import Publicidad from "./Publicidad";
import ModalPlaylist from "./ModalPlaylist";
import "./styles/AlbumDetails.css";

const esProd = window.location.hostname.includes("netlify");

function AlbumDetails({ reproducirLista, pausar }) {
  const { albumName, artistName } = useParams();
  const [albumInfo, setAlbumInfo] = useState(null);
  const [errorCarga, setErrorCarga] = useState(null);
  const [trackCargando, setTrackCargando] = useState(null);
  const [modalPlaylist, setModalPlaylist] = useState(false);
  const [cancionSeleccionada, setCancionSeleccionada] = useState(null);
  const [, setCancionesGuardadas] = useState([]);
  const navigate = useNavigate();

  const { mostrarPublicidad, conPublicidad, cerrarYContinuar } =
    usePublicidad(pausar);

  const role = localStorage.getItem("role") || "user";
  const esPremium = role === "premium" || role === "admin";

  useEffect(() => {
    const fetchAlbumDetails = async () => {
      try {
        // Usamos query string (no segmentos de ruta) para evitar que Apache
        // bloquee barras (%2F) en nombres tipo "AC/DC", y de paso evitamos
        // problemas con apóstrofes, exclamaciones, etc.
        const response = await fetch(
          `/api/albums?nombre=${encodeURIComponent(albumName)}&artista=${encodeURIComponent(artistName)}`,
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const mensaje = errorData?.error || `Error ${response.status} al buscar el álbum.`;
          console.warn("No se pudo encontrar el álbum en el backend:", mensaje);
          setErrorCarga(mensaje);
          return;
        }

        const data = await response.json();
        setAlbumInfo(data);
      } catch (error) {
        console.error("Error al traer el detalle:", error);
        setErrorCarga("No se pudo conectar con el servidor.");
      }
    };

    if (artistName && albumName) {
      fetchAlbumDetails();
    }
  }, [albumName, artistName]);

  useEffect(() => {
    const obtenerFavoritos = async () => {
      if (esProd) {
        const guardadas = JSON.parse(localStorage.getItem("favoritos") || "[]");
        const claves = guardadas.map((c) => `${c.artist}-${c.title}`);
        setCancionesGuardadas(claves);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        const canciones = data.map((c) => `${c.artist}-${c.title}`);
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
      const tracks = albumInfo.tracks;

      const trackLimpio = trackName
        .replace(
          /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/g,
          "",
        )
        .trim();
      const query = `${albumInfo.artista} ${trackLimpio} ${albumInfo.nombre}`;
      const response = await fetch(
        `/deezer/search?q=${encodeURIComponent(query)}`,
      );
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const trackEncontrado =
          data.data.find((t) =>
            t.title.toLowerCase().includes(trackLimpio.toLowerCase()),
          ) || data.data[0];

        const portadaBackend =
          albumInfo.portada_url || "https://via.placeholder.com/150";

        const listaSimple = tracks.map((t, i) => ({
          id: t.id,
          title: t.nombre
            .replace(
              /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f\u1100-\u11ff\u3130-\u318f\uac00-\ud7af]/g,
              "",
            )
            .trim(),
          artist: albumInfo.artista,
          url: i === index ? trackEncontrado.preview : null,
          cover: trackEncontrado.album?.cover_medium || portadaBackend,
        }));

        conPublicidad(() => {
          reproducirLista(listaSimple, index);
        });
      } else {
        alert(
          `No se encontró una vista previa de audio para "${trackLimpio}" en Deezer.`,
        );
      }
    } catch (error) {
      console.error("Error buscando en la API de Deezer:", error);
      alert("Hubo un error al conectar con el servidor de audio.");
    } finally {
      setTrackCargando(null);
    }
  };

  if (errorCarga) return (
    <div className="loading" style={{ color: esPremium ? '#d0b412' : '' }}>
      <p>😕 {errorCarga}</p>
    </div>
  );

  if (!albumInfo) return (
  <div className="loading" style={{ color: esPremium ? '#d0b412' : '' }}>
    Cargando...
  </div>
);

  return (
      <div className={`album-detail-container${esPremium ? ' is-premium' : ''}`}>

      {mostrarPublicidad && <Publicidad onCerrar={cerrarYContinuar} />}

      <header className="album-header">
  <img
    src={albumInfo.portada_url || "https://via.placeholder.com/300"}
    alt={albumInfo.nombre}
    className="detail-cover"
    style={{
      boxShadow:
        role === "premium" || role === "admin"
          ? "0 8px 24px rgba(208, 180, 18, 0.6)" 
          : "0 8px 24px rgba(0, 0, 0, 0.5)",     
    }}
  />
        <div className="header-info">
          <p className="type">Álbum</p>
          <h1 style={{ color: esPremium ? '#d0b412' : undefined }}>{albumInfo.nombre}</h1>
          <div className="album-metadata">
            <span
              className="artist-name-main"
              onClick={() =>
                navigate(`/artist/${encodeURIComponent(albumInfo.artista)}`)
              }
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) =>
                (e.target.style.textDecoration = "underline")
              }
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              {albumInfo.artista}
            </span>
            {albumInfo.genero && (
              <span className="genre-tag" style={{ color: esPremium ? '#d0b412' : '' }}> • {albumInfo.genero}</span>
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
            {albumInfo.tracks && albumInfo.tracks.length > 0 ? (
              albumInfo.tracks.map((track, index) => {
                return (
                  <div key={track.id ?? index} className="track-row">
                    <div className="track-number-wrapper">
                      <span className="track-number">{index + 1}</span>
                      <button
                        className="play-row-btn"
                        onClick={() => reproducirPista(track.nombre, index)}
                        disabled={false}

                      >
                        {trackCargando === index ? (
                          <span className="mini-spinner">...</span>
                        ) : (
                          <FaPlay />
                        )}
                      </button>
                    </div>
                    <span className="track-name">{track.nombre}</span>
                    <span className="track-duration">
                      {track.duracion
                        ? `${Math.floor(track.duracion / 60)}:${(track.duracion % 60).toString().padStart(2, "0")}`
                        : "0:00"}
                    </span>
                    <button
                      className={`add-playlist-btn ${!esPremium ? "add-playlist-btn--locked" : ""}`}
                      onClick={() => {
                        if (!esPremium) {
                          alert(
                            "🔒 Necesitás ser usuario Premium para agregar canciones.",
                          );
                          return;
                        }
                        setCancionSeleccionada({
                          title: track.nombre,
                          artist: albumInfo.artista,
                          album: albumInfo.nombre,
                          duration: track.duracion || 0,
                          genre: albumInfo.genero || "",
                        });
                        setModalPlaylist(true);
                      }}
                      disabled={false}
                      title={
                        !esPremium
                          ? "Función exclusiva Premium"
                          : "Agregar a playlist"
                      }
                    >
                      {!esPremium ? <FaLock /> : <FaPlus />}
                    </button>
                  </div>
                );
              })
            ) : (
              <p className="no-tracks">
                No se encontraron canciones para este álbum.
              </p>
            )}
          </div>
        </section>

        <aside className="album-sidebar">
          {albumInfo.descripcion ? (
            <div className="wiki-card">
              <h3>Sobre el álbum</h3>
              <p className="wiki-text">
                {albumInfo.descripcion.split("<a href")[0]}
              </p>
            </div>
          ) : (
            <div className="wiki-card">
              <p className="no-wiki">No hay descripción disponible.</p>
            </div>
          )}
        </aside>
      </div>

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
}

export default AlbumDetails;