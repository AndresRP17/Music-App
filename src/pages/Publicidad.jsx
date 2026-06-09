function Publicidad({ onCerrar }) {
  const esPremium = localStorage.getItem("esPremium") === "true";

  if (esPremium) {
    onCerrar();
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0,
      width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
      padding: '16px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#181818',
        border: '2px solid #ff4757',
        borderRadius: '12px',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '480px',   /* ← desktop: no más grande de 480px */
        textAlign: 'center',
        color: 'white'
      }}>
        <img
          src="/publi.jpg"
          alt="Publicidad"
          style={{
            width: '100%',
            height: 'clamp(180px, 40vw, 280px)', /* ← se adapta al tamaño de pantalla */
            objectFit: 'cover',
            display: 'block'
          }}
        />
        <div style={{ padding: '16px 20px 24px' }}>
          <span style={{
            background: '#ff4757', color: 'white',
            padding: '4px 8px', fontSize: '11px',
            fontWeight: 'bold', borderRadius: '4px'
          }}>PUBLICIDAD</span>
          <h3 style={{ margin: '12px 0', fontSize: 'clamp(14px, 4vw, 20px)' }}>
            Disfrutá la versión Premium sin anuncios
          </h3>
          <audio
            src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
            autoPlay
            onEnded={onCerrar}
          />
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>
            La música continuará automáticamente al finalizar el anuncio...
          </p>
          <button onClick={onCerrar} style={{
            background: '#2f3542', color: 'white',
            border: 'none', padding: '10px 24px',
            borderRadius: '20px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '14px',
            width: '100%'   /* ← en mobile ocupa todo el ancho */
          }}>
            Saltar Anuncio ✕
          </button>
        </div>
      </div>
    </div>
  );
}

export default Publicidad;