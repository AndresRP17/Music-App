import { useState, useEffect, useRef } from "react";
import { FaTimes, FaMusic, FaPlay, FaPause } from "react-icons/fa";
import "./ReproductorExpandido.css";

function ReproductorExpandido({ trackActual, audioRef, onCerrar }) {
  const [letra, setLetra] = useState(null);
  const [cargandoLetra, setCargandoLetra] = useState(true);
  const [errorLetra, setErrorLetra] = useState(false);
  const [reproduciendo, setReproduciendo] = useState(true);
  const [progreso, setProgreso] = useState(0);
  const [duracion, setDuracion] = useState(0);
  const progressRef = useRef(null);

  // Letra
  useEffect(() => {
    const fetchLetra = async () => {
      setCargandoLetra(true);
      setErrorLetra(false);
      setLetra(null);
      try {
        const res = await fetch(
          `https://api.lyrics.ovh/v1/${encodeURIComponent(trackActual.artist)}/${encodeURIComponent(trackActual.title)}`
        );
        if (!res.ok) throw new Error("No encontrada");
        const data = await res.json();
        if (data.lyrics) setLetra(data.lyrics);
        else setErrorLetra(true);
      } catch {
        setErrorLetra(true);
      } finally {
        setCargandoLetra(false);
      }
    };
    fetchLetra();
  }, [trackActual.title, trackActual.artist]);

  // Sincronizar progreso con el audio original
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

    // Estado inicial
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
    const x = e.clientX - rect.left;
    const porcentaje = x / rect.width;
    audio.currentTime = porcentaje * duracion;
  };

  const formatTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="rep-exp-overlay" onClick={onCerrar}>
      <div className="rep-exp-modal" onClick={e => e.stopPropagation()}>

        <button className="rep-exp-cerrar" onClick={onCerrar}>
          <FaTimes />
        </button>

        {/* Lado izquierdo: portada + controles propios */}
        <div className="rep-exp-izq">
          <img src={trackActual.cover} alt={trackActual.title} className="rep-exp-portada" />
          <h2 className="rep-exp-titulo">{trackActual.title}</h2>
          <p className="rep-exp-artista">{trackActual.artist}</p>

          {/* Barra de progreso custom */}
          <div className="rep-exp-progreso-wrap">
            <span className="rep-exp-tiempo">{formatTime(progreso)}</span>
            <div
              className="rep-exp-progreso-bar"
              ref={progressRef}
              onClick={handleProgressClick}
            >
              <div
                className="rep-exp-progreso-fill"
                style={{ width: duracion ? `${(progreso / duracion) * 100}%` : '0%' }}
              />
            </div>
            <span className="rep-exp-tiempo">{formatTime(duracion)}</span>
          </div>

          {/* Botón play/pause */}
          <button className="rep-exp-play-btn" onClick={togglePlay}>
            {reproduciendo ? <FaPause /> : <FaPlay />}
          </button>
        </div>

        {/* Lado derecho: letra */}
        <div className="rep-exp-der">
          <h3 className="rep-exp-letra-titulo">Letra</h3>

          {cargandoLetra && (
            <div className="rep-exp-estado">
              <div className="rep-exp-spinner" />
              <p>Buscando letra...</p>
            </div>
          )}

          {!cargandoLetra && errorLetra && (
            <div className="rep-exp-estado">
              <FaMusic style={{ fontSize: '32px', opacity: 0.2, marginBottom: '12px' }} />
              <p>No se encontró la letra de esta canción.</p>
            </div>
          )}

          {!cargandoLetra && letra && (
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