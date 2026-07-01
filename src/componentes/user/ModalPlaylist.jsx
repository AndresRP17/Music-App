/* eslint-disable */
import { useState, useEffect } from "react";
import { FaPlus, FaCheck } from "react-icons/fa";
import { IoIosClose } from "react-icons/io";
import { FiMusic } from "react-icons/fi";
import { useToast } from "../../context/ToastContext";
const esProd = window.location.hostname.includes("netlify");

const ModalPlaylist = ({ cancion, onCerrar }) => {
  const [playlists, setPlaylists] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [nombreNueva, setNombreNueva] = useState("");
  const [yaEnFavoritos, setYaEnFavoritos] = useState(false);
  const [cancionEnPlaylist, setCancionEnPlaylist] = useState({});
  const { mostrarToast } = useToast();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const tituloCancion = (cancion.title || cancion.name || "")
    .toLowerCase()
    .trim();
  const artistaCancion = (cancion.artist || "").toLowerCase().trim();

  // Chequea si una canción ya está (por título + artista)
  const yaExisteEnLista = (lista) =>
    lista.some(
      (s) =>
        (s.title || s.name || "").toLowerCase().trim() === tituloCancion &&
        (s.artist || "").toLowerCase().trim() === artistaCancion,
    );

  useEffect(() => {
    const obtenerPlaylists = async () => {
      if (esProd) {
        const guardadas = JSON.parse(localStorage.getItem("playlists") || "[]");
        setPlaylists(guardadas);

        // Chequear favoritos
        const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
        setYaEnFavoritos(yaExisteEnLista(favoritos));

        // Chequear canción en cada playlist
        const estadoPlaylists = {};
        for (const pl of guardadas) {
          const songs = JSON.parse(
            localStorage.getItem(`playlist_songs_${pl.id}`) || "[]",
          );
          estadoPlaylists[pl.id] = yaExisteEnLista(songs);
        }
        setCancionEnPlaylist(estadoPlaylists);
        setCargando(false);
        return;
      }

      try {
       
        const [playlistsRes, favRes] = await Promise.all([
          fetch("/api/playlists", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/favorites", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (playlistsRes.ok) {
          const data = await playlistsRes.json();
          setPlaylists(data);

          // Chequear cada playlist en paralelo
          const checks = await Promise.all(
            data.map(async (pl) => {
              try {
                const r = await fetch(`/api/playlist_songs/playlist/${pl.id}`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if (!r.ok) return { id: pl.id, existe: false };
                const songs = await r.json();
                return { id: pl.id, existe: yaExisteEnLista(songs) };
              } catch {
                return { id: pl.id, existe: false };
              }
            }),
          );

          const estadoPlaylists = {};
          checks.forEach(({ id, existe }) => {
            estadoPlaylists[id] = existe;
          });
          setCancionEnPlaylist(estadoPlaylists);
        }

        if (favRes.ok) {
          const favData = await favRes.json();
          setYaEnFavoritos(yaExisteEnLista(favData));
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setCargando(false);
      }
    };

    obtenerPlaylists();
  }, []);

  const playlistsFiltradas = playlists.filter((p) =>
    p.name.toLowerCase().includes(busqueda.toLowerCase()),
  );

  const agregarAPlaylist = async (playlist) => {
    // Si ya está, no hacer nada (el botón está deshabilitado, pero por si acaso)
    if (cancionEnPlaylist[playlist.id]) return;

    if (esProd) {
      const songs = JSON.parse(
        localStorage.getItem(`playlist_songs_${playlist.id}`) || "[]",
      );
      const nueva = {
        id: Date.now(),
        id_playlist: playlist.id,
        title: cancion.title || cancion.name,
        artist: cancion.artist,
        album: cancion.album || "",
        duration: cancion.duration || 0,
        genre: cancion.genre || "",
      };
      localStorage.setItem(
        `playlist_songs_${playlist.id}`,
        JSON.stringify([...songs, nueva]),
      );
      mostrarToast(`"${nueva.title}" agregada a "${playlist.name}"`);
      onCerrar();
      return;
    }

    try {
      const response = await fetch("/api/playlist_songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_playlist: playlist.id,
          title: cancion.title || cancion.name,
          artist: cancion.artist,
          album: cancion.album || "",
          duration: cancion.duration || 0,
          genre: cancion.genre || "",
        }),
      });
      if (response.ok) {
        mostrarToast(
          `"${cancion.title || cancion.name}" agregada a "${playlist.name}"`,
        );
        onCerrar();
      } else if (response.status === 409) {
        mostrarToast(
          `"${cancion.title || cancion.name}" ya está en "${playlist.name}"`,
          "error",
        );
        onCerrar();
      } else {
        mostrarToast("Error al agregar la canción", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarToast("Error al agregar la canción", "error");
    }
  };

  const crearYAgregar = async () => {
    if (!nombreNueva.trim()) return;

    if (esProd) {
      const playlistsActuales = JSON.parse(
        localStorage.getItem("playlists") || "[]",
      );
      const nueva = { id: Date.now(), name: nombreNueva };
      localStorage.setItem(
        "playlists",
        JSON.stringify([...playlistsActuales, nueva]),
      );
      await agregarAPlaylist(nueva);
      return;
    }

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_user: userId, name: nombreNueva }),
      });
      if (response.ok) {
        const nueva = await response.json();
        await agregarAPlaylist({ id: nueva.id, name: nombreNueva });
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarToast("Error al crear la playlist", "error");
    }
  };

  const agregarAFavoritos = async () => {
    if (yaEnFavoritos) return;

    if (esProd) {
      const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
      const nuevo = {
        id: Date.now(),
        title: cancion.title || cancion.name,
        artist: cancion.artist,
        album: cancion.album || "",
        duration: cancion.duration || 0,
        genre: cancion.genre || "",
      };
      localStorage.setItem("favoritos", JSON.stringify([...favoritos, nuevo]));
      mostrarToast(`"${nuevo.title}" agregada a Favoritos`);
      onCerrar();
      return;
    }

    try {
      const response = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: cancion.title || cancion.name,
          artist: cancion.artist,
          album: cancion.album || "",
          duration: cancion.duration || 0,
          genre: cancion.genre || "",
        }),
      });
      if (response.ok) {
        mostrarToast(`"${cancion.title || cancion.name}" agregada a Favoritos`);
        onCerrar();
      } else if (response.status === 409) {
        mostrarToast(
          `"${cancion.title || cancion.name}" ya está en Favoritos`,
          "error",
        );
        onCerrar();
      } else {
        mostrarToast("Error al agregar a favoritos", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      mostrarToast("Error al agregar a favoritos", "error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          background: "var(--color-background-primary, #1a1a1a)",
          borderRadius: "12px",
          width: "320px",
          overflow: "hidden",
          border: "0.5px solid #333",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            borderBottom: "0.5px solid #333",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "15px",
              fontWeight: 500,
              color: "#d0b412",
            }}
          >
            Opciones para agregar
          </h2>
          <button
            onClick={onCerrar}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#d0b412",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <IoIosClose />
          </button>
        </div>

        {cargando ? (
          <div
            style={{
              padding: "10px 16px",
              borderBottom: "0.5px solid #333",
              fontSize: "14px",
              color: "#d0b412",
              opacity: 0.6,
            }}
          >
            Verificando favoritos...
          </div>
        ) : (
          <div
            onClick={yaEnFavoritos ? undefined : agregarAFavoritos}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 16px",
              cursor: yaEnFavoritos ? "default" : "pointer",
              borderBottom: "0.5px solid #333",
              opacity: yaEnFavoritos ? 0.6 : 1,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              if (!yaEnFavoritos) e.currentTarget.style.background = "#2a2a2a";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                background: "#2a2a2a",
                border: "0.5px solid #444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "#d0b412",
                  fontSize: "16px",
                }}
              >
                {yaEnFavoritos ? "✓" : "♥"}
              </span>
            </div>
            <div style={{ fontSize: "14px", color: "#d0b412" }}>
              {yaEnFavoritos ? "Ya está en Favoritos" : "Agregar a Favoritos"}
            </div>
          </div>
        )}

        {/* Buscador */}
        <div style={{ padding: "10px 16px", borderBottom: "0.5px solid #333" }}>
          <input
            type="text"
            placeholder="Buscar playlist..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "7px 10px",
              fontSize: "13px",
              borderRadius: "8px",
              border: "0.5px solid #444",
              background: "#2a2a2a",
              color: "#d0b412",
            }}
          />
        </div>

        {/* Lista de playlists */}
        <div style={{ maxHeight: "220px", overflowY: "auto" }}>
          {cargando ? (
            <p style={{ padding: "16px", color: "#d0b412", fontSize: "14px" }}>
              Cargando...
            </p>
          ) : playlistsFiltradas.length === 0 ? (
            <p style={{ padding: "16px", color: "#d0b412", fontSize: "14px" }}>
              No se encontraron playlists
            </p>
          ) : (
            playlistsFiltradas.map((playlist) => {
              const yaEsta = !!cancionEnPlaylist[playlist.id];
              return (
                <div
                  key={playlist.id}
                  onClick={() => !yaEsta && agregarAPlaylist(playlist)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 16px",
                    cursor: yaEsta ? "default" : "pointer",
                    opacity: yaEsta ? 0.6 : 1,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!yaEsta) e.currentTarget.style.background = "#d0b412";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: "#2a2a2a",
                      border: `0.5px solid ${yaEsta ? "#d0b412" : "#d0b412"}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {yaEsta ? (
                      <FaCheck style={{ color: "#d0b412", fontSize: "14px" }} />
                    ) : (
                      <FiMusic style={{ color: "#d0b412", fontSize: "16px" }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "14px",
                        color: yaEsta ? "#d0b412" : "#fff",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {playlist.name}
                    </div>
                    {yaEsta && (
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#d0b412",
                          marginTop: "1px",
                        }}
                      >
                        Ya agregada
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Crear nueva playlist */}
        <div style={{ padding: "10px 16px", borderTop: "0.5px solid #333" }}>
          {creandoNueva ? (
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Nombre de la playlist..."
                value={nombreNueva}
                onChange={(e) => setNombreNueva(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && crearYAgregar()}
                autoFocus
                style={{
                  flex: 1,
                  padding: "7px 10px",
                  fontSize: "13px",
                  borderRadius: "8px",
                  border: "0.5px solid #444",
                  background: "#2a2a2a",
                  color: "#d0b412",
                }}
              />
              <button
                onClick={crearYAgregar}
                style={{
                  background: "#d0b412",
                  border: "none",
                  borderRadius: "8px",
                  color: "black",
                  padding: "7px 12px",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Crear
              </button>
            </div>
          ) : (
            <button
              onClick={() => setCreandoNueva(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#d0b412",
                fontSize: "14px",
                padding: "4px 0",
              }}
            >
              <FaPlus style={{ fontSize: "13px" }} /> Crear nueva playlist
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalPlaylist;