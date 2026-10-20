import { useState, useRef, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { FiSettings, FiLogOut } from "react-icons/fi";
import ReproductorExpandido from "./ReproductorExpandido";
import Sidebar from "./Sidebar";
import ModalConfirmarLogout from "./ModalConfirmarLogout";
import NavInferior from "./NavInferior";

// true cuando la pantalla es de celular (mismo corte que usa Sidebar.css)
function useEsMobile(max = 768) {
  const consulta = `(max-width: ${max}px)`;
  const [esMobile, setEsMobile] = useState(() => window.matchMedia(consulta).matches);

  useEffect(() => {
    const mq = window.matchMedia(consulta);
    const onChange = (e) => setEsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [consulta]);

  return esMobile;
}

function ClienteLayout({ trackActual, setTrackActual, listaActual, indexActual, reproducirLista, cerrarSesion, onPausarRef }) {
  const [expandido, setExpandido] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [confirmarLogout, setConfirmarLogout] = useState(false);
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");
  const audioRef = useRef(null);
  const token = localStorage.getItem('token');
  const esMobile = useEsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (onPausarRef) {
      onPausarRef.current = () => audioRef.current?.pause();
    }
  }, []);

  // El dorado de premium/admin también se aplica a la barra inferior
  useEffect(() => {
    const sincronizarRol = () => setRole(localStorage.getItem("role") || "user");
    window.addEventListener("rolActualizado", sincronizarRol);
    return () => window.removeEventListener("rolActualizado", sincronizarRol);
  }, []);

  const buscarYReproducir = async (index) => {
    const cancion = listaActual[index];
    if (!cancion) return;

    if (cancion.id) {
      const token = localStorage.getItem('token');
      fetch('/api/historial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id_track: cancion.id }),
      }).catch((err) => console.error("Error registrando historial:", err));
    }

    if (cancion.url) {
      reproducirLista(listaActual, index);
      return;
    }

    try {
      const query = `${cancion.artist} ${cancion.title}`;
      const res = await fetch(`/deezer/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.data && data.data.length > 0) {
        const track = data.data[0];
        const listaActualizada = listaActual.map((t, i) =>
          i === index ? { ...t, url: track.preview, cover: track.album?.cover_medium || t.cover } : t
        );
        reproducirLista(listaActualizada, index);
      }
    } catch (err) {
      console.error("Error buscando en Deezer:", err);
    }
  };

  const reproducirAnterior = () => {
    if (listaActual.length === 0 || indexActual <= 0) return;
    buscarYReproducir(indexActual - 1);
  };

  const reproducirSiguiente = () => {
    if (listaActual.length === 0 || indexActual >= listaActual.length - 1) return;
    buscarYReproducir(indexActual + 1);
  };

  // ---------- Barra inferior (solo mobile) ----------
  const tabsMobile = [
    { id: "/", label: "Inicio", icono: "inicio" },
    { id: "/mi-musica", label: "Música", icono: "biblioteca" },
    { id: "/configuracion", label: "Ajustes", icono: <FiSettings /> },
    { id: "salir", label: "Salir", icono: <FiLogOut /> },
  ];

  const rutaActiva = () => {
    const p = location.pathname;
    if (p === "/") return "/";
    if (p.startsWith("/mi-musica") || p.startsWith("/playlist")) return "/mi-musica";
    if (p.startsWith("/configuracion")) return "/configuracion";
    return null;
  };

  const alternarPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const acento = role === "premium" || role === "admin" ? "#d0b412" : null;

  return (
    <div className="container">
      {!esMobile && <Sidebar cerrarSesion={cerrarSesion} />}
      <Outlet />

      {/* ---------- MOBILE: audio oculto + barra estilo Apple Music ---------- */}
      {esMobile && (
        <>
          {trackActual && (
            <audio
              ref={audioRef}
              src={trackActual.url}
              autoPlay
              style={{ display: "none" }}
              onPlay={() => setReproduciendo(true)}
              onPause={() => setReproduciendo(false)}
            />
          )}

          <NavInferior
            tabs={tabsMobile}
            activa={rutaActiva()}
            onCambiar={(id) => (id === "salir" ? setConfirmarLogout(true) : navigate(id))}
            cancion={
              trackActual
                ? {
                    titulo: trackActual.title,
                    artista: trackActual.artist,
                    portada: trackActual.cover,
                  }
                : null
            }
            reproduciendo={reproduciendo}
            onPlayPause={alternarPlay}
            onSiguiente={reproducirSiguiente}
            onAbrirReproductor={() => setExpandido(true)}
            onBuscar={() => navigate("/search")}
            acento={acento}
          />

          {confirmarLogout && (
            <ModalConfirmarLogout
              onConfirmar={cerrarSesion}
              onCancelar={() => setConfirmarLogout(false)}
            />
          )}
        </>
      )}

      {/* ---------- DESKTOP: reproductor fijo de siempre ---------- */}
      {trackActual && !esMobile && (
        <div className="reproductor-fijo-abajo">
          <div
            className="reproductor-info-tema"
            onClick={() => setExpandido(true)}
            style={{ cursor: 'pointer' }}
          >
            <img src={trackActual.cover} alt={trackActual.title} className="reproductor-portada" />
            <div>
              <h4 className="reproductor-titulo">{trackActual.title}</h4>
              <p className="reproductor-artista">{trackActual.artist}</p>
            </div>
          </div>

          <audio
            ref={audioRef}
            src={trackActual.url}
            controls
            autoPlay
            className="reproductor-audio"
            style={{ visibility: expandido ? 'none' : 'visible' }}
          />

          <button className="reproductor-cerrar" onClick={() => setTrackActual(null)}>×</button>
        </div>
      )}

      {/* ---------- Reproductor expandido (letra, progreso, etc.) ---------- */}
      {trackActual && expandido && (
        <ReproductorExpandido
          trackActual={trackActual}
          audioRef={audioRef}
          listaActual={listaActual}
          indexActual={indexActual}
          onAnterior={reproducirAnterior}
          onSiguiente={reproducirSiguiente}
          onCerrar={() => setExpandido(false)}
        />
      )}
    </div>
  );
}

export default ClienteLayout;