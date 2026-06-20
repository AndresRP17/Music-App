// src/hooks/usePublicidad.js
// Hook compartido para manejar el contador de publicidad
// Usalo en Home, Search, o cualquier componente que reproduzca contenido

import { useState } from 'react';

export function usePublicidad() {
  const [mostrarPublicidad, setMostrarPublicidad] = useState(false);
  const [accionPendiente, setAccionPendiente] = useState(null);

  // Llamá a esta función en vez de ejecutar la acción directo
  // accion: función a ejecutar después del ad (o inmediatamente si no toca)
  const conPublicidad = (accion) => {
    const clicks = parseInt(localStorage.getItem('contadorPublicidad')) || 0;
    const siguiente = clicks + 1;

    if (siguiente >= 3) {
      localStorage.setItem('contadorPublicidad', '0');
      setAccionPendiente(() => accion); // guardamos la función
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