import { useState } from 'react';

export function usePublicidad(setTrackActual) {
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const conPublicidad = (accion) => {
    const clicks = parseInt(localStorage.getItem('contadorPublicidad')) || 0;
    const siguiente = clicks + 1;

    if (siguiente >= 3) {
      localStorage.setItem('contadorPublicidad', '0');
      setAccionPendiente(() => accion);
      // Pausar la canción actual antes de mostrar el ad
      if (setTrackActual) setTrackActual(null);
      setMostrarPublicidad(true);
    } else {
      localStorage.setItem('contadorPublicidad', siguiente.toString());
      accion();
    }
  };

  const cerrarYContinuar = () => {
    setMostrarPublicidad(false);
    if (accionPendiente) {
      accionPendiente();
      setAccionPendiente(null);
    }
  };

  return { mostrarPublicidad, conPublicidad, cerrarYContinuar };
}