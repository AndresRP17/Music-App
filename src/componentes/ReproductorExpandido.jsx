import { useState, useEffect } from "react";
import { FaTimes, FaMusic } from "react-icons/fa";
import "./ReproductorExpandido.css";

function ReproductorExpandido({ trackActual, onCerrar }) {
  const [letra, setLetra] = useState(null);
  const [cargandoLetra, setCargandoLetra] = useState(true);
  const [errorLetra, setErrorLetra] = useState(false);

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
        if (data.lyrics) {
          setLetra(data.lyrics);
        } else {
          setErrorLetra(true);
        }
      } catch {
        setErrorLetra(true);
      } finally {
        setCargandoLetra(false);
      }
    };

    fetchLetra();
  }, [trackActual.title, trackActual.artist]);

  return (
    <div className="rep-exp-overlay" onClick={onCerrar}>
      <div className="rep-exp-modal" onClick={e => e.stopPropagation()}>

        <button className="rep-exp-cerrar" onClick={onCerrar}>
          <FaTimes />
        </button>

        {/* Lado izquierdo: portada + info */}
        <div className="rep-exp-izq">
          <img src={trackActual.cover} alt={trackActual.title} className="rep-exp-portada" />
          <h2 className="rep-exp-titulo">{trackActual.title}</h2>
          <p className="rep-exp-artista">{trackActual.artist}</p>
          <audio
            src={trackActual.url}
            controls
            autoPlay
            className="rep-exp-audio"
          />
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