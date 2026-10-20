import { useEffect, useState } from "react";

const CLAVE = "aviso_proyecto_visto";
const esDemo = window.location.hostname.includes("netlify");

const yaVisto = () => {
  try {
    return localStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
};

export default function AvisoProyecto() {
  // Se abre solo la primera vez que alguien entra
  const [abierto, setAbierto] = useState(() => !yaVisto());

  const cerrar = () => {
    setAbierto(false);
    try {
      localStorage.setItem(CLAVE, "1");
    } catch {
      /* si no hay storage, no pasa nada */
    }
  };

  // Escape cierra el modal
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto]);

  return (
    <>
      {/* Botón flotante para volver a abrir el aviso */}
      <button
        type="button"
        className="aviso-fab"
        onClick={() => setAbierto(true)}
        aria-label="Sobre el proyecto"
      >
        <span className="aviso-fab-icon">i</span>
        <span className="aviso-fab-text">Sobre el proyecto</span>
      </button>

      {abierto && (
        <div className="aviso-overlay" onClick={cerrar}>
          <div
            className="aviso-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="aviso-titulo"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="aviso-badge">Proyecto de programación</span>

            <h2 id="aviso-titulo">Bienvenido a MusicApp</h2>
            <p className="aviso-intro">
              Esta app es un proyecto personal hecho para aprender y practicar
              programación (React, CodeIgniter 4 y MySQL). No es un servicio
              comercial.
            </p>

            <ul className="aviso-lista">
              <li>
                Podés crear una cuenta para probarla, pero evitá usar una
                contraseña que uses en otros sitios.
              </li>
              <li>
                La música, las portadas y las letras vienen de APIs públicas de
                terceros y se usan solo con fines demostrativos.
              </li>
              {esDemo && (
                <li>
                  Estás en la versión demo: el ingreso es simulado y no se
                  guarda ningún dato.
                </li>
              )}
            </ul>

            <button
              type="button"
              className="login-submit-btn aviso-btn"
              onClick={cerrar}
              autoFocus
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}