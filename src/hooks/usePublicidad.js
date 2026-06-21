import { useState } from 'react';

export function usePublicidad(setTrackActual) {
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  const conPublicidad = (accion) => {
    const clicks = parseInt(localStorage.getItem('contadorPublicidad')) || 0;
    const siguiente = clicks + 1;

    if (siguiente >= 3) {
      localStorage.setItem('contadorPublicidad', '0');
      if (setTrackActual) setTrackActual(null); // pausa limpiando el track
      setAccionPendiente(() => accion);
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