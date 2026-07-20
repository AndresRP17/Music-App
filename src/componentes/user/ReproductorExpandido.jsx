import { useState, useEffect, useRef } from "react";
import { FaTimes, FaMusic, FaPlay, FaPause, FaStepBackward, FaStepForward, FaAlignLeft } from "react-icons/fa";
import "./styles/ReproductorExpandido.css";

function parseLRC(lrc) {
  const lineas = lrc.split('\n');
  const resultado = [];
  const regex = /\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/;
  for (const linea of lineas) {
    const match = linea.match(regex);
    if (match) {
      const min = parseInt(match[1]);
      const sec = parseInt(match[2]);
      const ms = parseInt(match[3].padEnd(3, '0'));
      const tiempo = min * 60 + sec + ms / 1000;
      resultado.push({ tiempo, texto: match[4].trim() });
    }
  }
  return resultado.sort((a, b) => a.tiempo - b.tiempo);
}

const SKELETON_WIDTHS = Array.from({ length: 12 }, () => `${55 + Math.random() * 40}%`);

function ReproductorExpandido({ trackActual, audioRef, listaActual, indexActual, onAnterior, onSiguiente, onCerrar }) {
  const [letra, setLetra] = useState(null);
  const [lrcLineas, setLrcLineas] = useState(null);
  const [lineaActiva, setLineaActiva] = useState(0);
  const [cargandoLetra, setCargandoLetra] = useState(true);
  const [errorLetra, setErrorLetra] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const [mostrarLetra, setMostrarLetra] = useState(false);
  const progressRef = useRef(null);
  const letraContenedorRef = useRef(null);
  const lineaActivaRef = useRef(null);
  const role = localStorage.getItem("role") || "user";

  const hayAnterior = listaActual.length > 0 && indexActual > 0;
  const haySiguiente = listaActual.length > 0 && indexActual < listaActual.length - 1;

  useEffect(() => {
  const fetchLetra = async () => {
    setCargandoLetra(true);
    setErrorLetra(false);
    setLetra(null);
    setLrcLineas(null);
    setLineaActiva(0);

    try {
      if (!trackActual.id) {
        // Sin id de track no podemos usar el cache propio, fallback a lrclib directo
        throw new Error("Sin id de track");
      }

      const url = `/api/lyrics?id_track=${trackActual.id}&artista=${encodeURIComponent(trackActual.artist)}&titulo=${encodeURIComponent(trackActual.title)}`;
      console.log("Pidiendo letra a:", url, "trackActual:", trackActual);

      const res = await fetch(url);

      if (!res.ok) {
        const errBody = await res.json().catch(() => null);
        console.error("Respuesta no OK:", res.status, errBody);
        throw new Error("No encontrada");
      }
      const data = await res.json();
      console.log("Letra recibida:", data);

      if (data.letra_sincronizada) {
        setLrcLineas(parseLRC(data.letra_sincronizada));
      } else if (data.letra_plana) {
        setLetra(data.letra_plana);
      } else {
        setErrorLetra(true);
      }
    } catch (error) {
      console.error("Error trayendo letra:", error, "trackActual:", trackActual);
      setErrorLetra(true);
    } finally {
      setCargandoLetra(false);
    }
  };
  fetchLetra();
}, [trackActual.title, trackActual.artist, trackActual.id]);

  useEffect(() => {
    if (!lrcLineas) return;
    const audio = audioRef.current;
    if (!audio) return;

   const onTimeUpdate = () => {
  const offset = trackActual.offsetPreview || 0;
  const t = audio.currentTime + offset;  // <- ajustado
  let idx = 0;
  for (let i = 0; i < lrcLineas.length; i++) {
    if (lrcLineas[i].tiempo <= t) idx = i;
    else break;
  }
  setLineaActiva(idx);
};

    audio.addEventListener('timeupdate', onTimeUpdate);
    return () => audio.removeEventListener('timeupdate', onTimeUpdate);
  }, [lrcLineas, audioRef]);

  useEffect(() => {
    if (lineaActivaRef.current && letraContenedorRef.current) {
      lineaActivaRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [lineaActiva]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setProgreso(audio.currentTime);
    const onDuration = () => setDuracion(audio.duration);
    const onPlay = () => setReproduciendo(true);
    const onPause = () => setReproduciendo(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDuration);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    setProgreso(audio.currentTime);
    setDuracion(audio.duration || 0);
    setReproduciendo(!audio.paused);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDuration);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, [audioRef]);

  useEffect(() => {
  }, [trackActual.title]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play();
    else audio.pause();
  };

  const handleProgressClick = (e) => {
    const audio = audioRef.current;
    if (!audio || !duracion) return;
    const rect = progressRef.current.getBoundingClientRect();
    const porcentaje = (e.clientX - rect.left) / rect.width;
    audio.currentTime = porcentaje * duracion;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  const saltarALinea = (tiempo) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = tiempo;
  };

  const sincronizarConLinea = async (lineaClickeada) => {
  const audio = audioRef.current;
  if (!audio) return;
  const offsetCalculado = lineaClickeada.tiempo - audio.currentTime;

  try {
    await fetch('/api/tracks/offset', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_track: trackActual.id, offset: offsetCalculado }),
    });
    trackActual.offsetPreview = offsetCalculado; // actualizamos en memoria también
  } catch (error) {
    console.error("Error guardando offset:", error);
  }
};
  return (
    <div className="rep-exp-overlay" onClick={onCerrar}>
      <div
        className={`rep-exp-modal ${mostrarLetra ? 'rep-exp-modal--expandido' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="rep-exp-cerrar" onClick={onCerrar}>
          <FaTimes />
        </button>

        <div className="rep-exp-izq">
          <img src={trackActual.cover} alt={trackActual.title} className="rep-exp-portada" 
          style={{
                          borderBottom:
                            role === "premium" || role === "admin"
                              ? "3px solid #d0b412"
                              : "none",}}
                    
          />
          <h2 className="rep-exp-titulo">{trackActual.title}</h2>
          <p className="rep-exp-artista">{trackActual.artist}</p>

          <div className="rep-exp-progreso-wrap">
            <span className="rep-exp-tiempo">{formatTime(progreso)}</span>
            <div className="rep-exp-progreso-bar" ref={progressRef} onClick={handleProgressClick}>
              <div
  className="rep-exp-progreso-fill"
  style={{
    width: duracion ? `${(progreso / duracion) * 100}%` : "0%",
    background:
      role === "premium" || role === "admin"
        ? "#d0b412"
        : "#b80f0f",
  }}
/>
            </div>
            <span className="rep-exp-tiempo">{formatTime(duracion)}</span>
          </div>

          <div className="rep-exp-controles">
            <button className="rep-exp-skip-btn" onClick={onAnterior} disabled={!hayAnterior} title="Anterior" style={{
                          backgroundColor:
                            role === "premium" || role === "admin"
                              ? "#d0b412"
                              : "none",}}>
              <FaStepBackward />
            </button>
            <button
  className="rep-exp-play-btn"
  onClick={togglePlay}
  style={{
    background:
      role === "premium" || role === "admin"
        ? "#d0b412"
        : "#b80f0f",
  }}
>
  {reproduciendo ? <FaPause /> : <FaPlay />}
</button>
            <button className="rep-exp-skip-btn" onClick={onSiguiente} disabled={!haySiguiente} title="Siguiente"
            style={{
                          backgroundColor:
                            role === "premium" || role === "admin"
                              ? "#d0b412"
                              : "none",}}
                    >
              <FaStepForward />
            </button>
          </div>

          <button
            className="rep-exp-letra-toggle"
            onClick={() => setMostrarLetra(v => !v)}
          >
            <FaAlignLeft />
            {mostrarLetra ? 'Ocultar letra' : 'Ver letra'}
          </button>
        </div>

        <div className={`rep-exp-der ${mostrarLetra ? 'rep-exp-der--visible' : ''}`}>
          <h3 className="rep-exp-letra-titulo"></h3>

          {cargandoLetra && (
  <div className="rep-exp-skeleton">
    {SKELETON_WIDTHS.map((width, i) => (
      <div key={i} className="rep-exp-skeleton-line" style={{ width }} />
    ))}
  </div>
)}

          {!cargandoLetra && errorLetra && (
            <div className="rep-exp-estado">
              <FaMusic style={{ fontSize: '32px', opacity: 0.2, marginBottom: '12px' }} />
              <p>No se encontró la letra de esta canción.</p>
            </div>
          )}

          {!cargandoLetra && lrcLineas && (
  <div className="rep-exp-letra-contenido" ref={letraContenedorRef}>
    <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>
      Tip: Ctrl+click en una línea para sincronizarla con el audio actual
    </p>
    {lrcLineas.map((linea, i) => (
      <p
        key={i}
        ref={i === lineaActiva ? lineaActivaRef : null}
        className={`rep-exp-linea-lrc ${i === lineaActiva ? 'rep-exp-linea-activa' : ''}`}
        onClick={(e) => {
          if (e.ctrlKey || e.metaKey) {
            sincronizarConLinea(linea);
          } else {
            saltarALinea(linea.tiempo);
          }
        }}
      >
        {linea.texto || '\u00A0'}
      </p>
    ))}
  </div>
)}
          

          {!cargandoLetra && letra && !lrcLineas && (
            <div className="rep-exp-letra-contenido">
              {letra.split('\n').map((linea, i) => (
                <p key={i} className={linea.trim() === '' ? 'rep-exp-linea-vacia' : 'rep-exp-linea'}>
                  {linea || '\u00A0'}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReproductorExpandido;