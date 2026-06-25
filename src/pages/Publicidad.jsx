import { useEffect, useState, useRef } from 'react';

function Publicidad({ onCerrar }) {
  const [segundos, setSegundos] = useState(5);
  const [puedeSkippear, setPuedeSkippear] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);
  const [tabOculta, setTabOculta] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [resetMsg, setResetMsg] = useState(false);
  
  const btnRef = useRef(null);
  const lastPos = useRef({ x: 0, y: 0, time: Date.now() });
  const segundosRef = useRef(5);
  const puedeSkippearRef = useRef(false);

  // Levantamos el rol dinámicamente
  const role = localStorage.getItem("role") || "user";
  const esPremium = role === "premium" || role === "admin";

  useEffect(() => {
    // 1. Si ya es Premium o Admin, cerramos al toque
    if (esPremium) {
      onCerrar();
      return;
    }

    // 2. Pedir permiso de notificaciones a los 2s
    const tNotif = setTimeout(async () => {
      if (!('Notification' in window)) return;
      if (Notification.permission === 'denied') return;

      const permiso = await Notification.requestPermission();
      if (permiso === 'granted') {
        new Notification('🎵 Tu música está pausada', {
          body: 'Volvé al anuncio para seguir escuchando...',
          icon: '/icon.png',
        });
      }
    }, 2000);

    // 3. Intervalo de la cuenta regresiva del anuncio (5s)
    const intervalo = setInterval(() => {
      setSegundos(prev => {
        const nuevo = prev - 1;
        segundosRef.current = nuevo;
        if (nuevo <= 0) {
          clearInterval(intervalo);
          setPuedeSkippear(true);
          puedeSkippearRef.current = true;
          return 0;
        }
        return nuevo;
      });
    }, 1000);

    // 4. Manejador de cambio de pestaña (Anti-trampas)
    const handleVisibility = () => {
      const oculta = document.hidden;
      setTabOculta(oculta);
      if (oculta && Notification.permission === 'granted') {
        new Notification('👀 ¡Ey! ¡Volvé al anuncio!', {
          body: 'Se pausó tu música por salir de la pestaña...',
          icon: '/icon.png',
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // ✨ LIMPIEZA TOTAL: Desmontamos timers y eventos limpiamente
    return () => {
      clearInterval(intervalo);
      clearTimeout(tNotif);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [onCerrar, esPremium]);

  // Manejo del mouse (Botón esquivo y detector de velocidad de movimiento)
  const handleMouseMove = (e) => {
    if (!btnRef.current) return;

    // --- botón que escapa ---
    if (!puedeSkippearRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 80) {
        const angle = Math.atan2(dy, dx);
        setOffset(prev => ({
          x: Math.max(-120, Math.min(120, prev.x - Math.cos(angle) * 60)),
          y: Math.max(-20, Math.min(20, prev.y - Math.sin(angle) * 60)),
        }));
      }
    }

    // --- detectar velocidad y resetear countdown ---
    const now = Date.now();
    const dt = now - lastPos.current.time;
    if (dt > 0) {
      const dx = e.clientX - lastPos.current.x;
      const dy = e.clientY - lastPos.current.y;
      const velocidad = Math.sqrt(dx * dx + dy * dy) / dt;

      if (velocidad > 1.5 && !puedeSkippearRef.current) {
        setSegundos(5);
        segundosRef.current = 5;
        setResetMsg(true);
        setTimeout(() => setResetMsg(false), 1500);
      }
    }

    lastPos.current = { x: e.clientX, y: e.clientY, time: now };
  };

  if (esPremium) return null;

  // Abajo continuaría tu return (...) con el HTML de la publicidad

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 9999, padding: '16px', boxSizing: 'border-box'
      }}
      onMouseMove={handleMouseMove}
    >

      {mostrarConfirm && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000
        }}>
          <div style={{
            background: '#181818', border: '2px solid #ff4757',
            borderRadius: '12px', padding: '28px 24px',
            textAlign: 'center', color: 'white', maxWidth: '320px'
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>😢</div>
            <h3 style={{ margin: '0 0 8px', color: 'white' }}>¿Seguro que querés saltar?</h3>
            <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '20px' }}>
              Perdés el 50% de descuento en Premium si cerrás ahora...
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onCerrar} style={{
                flex: 1, background: '#ff4757', color: 'white',
                border: 'none', padding: '10px', borderRadius: '20px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>Sí, saltar</button>
              <button onClick={() => setMostrarConfirm(false)} style={{
                flex: 1, background: '#2f3542', color: 'white',
                border: 'none', padding: '10px', borderRadius: '20px',
                cursor: 'pointer', fontWeight: 'bold'
              }}>Quedarme</button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        background: '#181818', border: '2px solid #ff4757',
        borderRadius: '12px', overflow: 'hidden',
        width: '100%', maxWidth: '480px',
        textAlign: 'center', color: 'white'
      }}>
        <img src="/images.jpg" alt="Publicidad" style={{
          width: '100%', height: 'clamp(180px, 50vw, 400px)',
          objectFit: 'cover', display: 'block'
        }} />

        <div style={{ padding: '16px 20px 24px' }}>
          <span style={{
            background: '#ff4757', color: 'white',
            padding: '4px 8px', fontSize: '11px',
            fontWeight: 'bold', borderRadius: '4px'
          }}>PUBLICIDAD</span>

          <h3 style={{ margin: '12px 0', fontSize: 'clamp(14px, 4vw, 20px)', color: 'white' }}>
            {tabOculta
              ? '👀 ¡Ey! ¡Volvé al anuncio!'
              : 'Disfrutá la versión Premium sin anuncios'}
          </h3>

          <audio
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            autoPlay
            onEnded={onCerrar}
          />

          <p style={{ fontSize: '13px', color: tabOculta ? '#ff4757' : '#aaa', marginBottom: '8px' }}>
            {tabOculta
              ? 'Se pausó tu música por salir de la pestaña...'
              : 'La música continuará automáticamente al finalizar el anuncio...'}
          </p>

          {/* Mensaje de reset */}
          <p style={{
            fontSize: '12px', color: '#ff4757',
            marginBottom: '8px', minHeight: '18px',
            transition: 'opacity 0.3s',
            opacity: resetMsg ? 1 : 0
          }}>
            ¡Movés el mouse muy rápido! Contador reiniciado 😈
          </p>

          <div
            style={{ position: 'relative', height: '60px' }}
          >
            <button
              ref={btnRef}
              onClick={puedeSkippear ? () => setMostrarConfirm(true) : undefined}
              style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                background: puedeSkippear ? '#2f3542' : '#555',
                color: puedeSkippear ? 'white' : '#999',
                border: 'none', padding: '10px 28px',
                borderRadius: '20px',
                cursor: puedeSkippear ? 'pointer' : 'not-allowed',
                fontWeight: 'bold', fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: 'background 0.3s, color 0.3s',
              }}
            >
              {puedeSkippear ? 'Saltar Anuncio ✕' : `Saltar en ${segundos}...`}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Publicidad;