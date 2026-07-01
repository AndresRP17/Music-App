import "./styles/ModalBienvenida.css"; 

function ModalCancelPremium({ onClose }) {
  return (
    <div className="modal-premium-overlay">
      <div className="modal-premium-box" style={{ borderColor: '#555' }}>
        <div className="modal-premium-crown">😢</div>
        <h2 className="modal-premium-titulo" style={{ color: '#aaa' }}>
          ¡Te vamos a extrañar!
        </h2>
        <p className="modal-premium-sub">
          Volviste al plan gratuito. Esperamos verte de vuelta pronto.
        </p>

        <div className="modal-premium-features">
          {[
            { icon: "🚫", texto: "Volverán los anuncios" },
            { icon: "👑", texto: "Perdés el modo dorado" },
            { icon: "💔", texto: "No podras acceder a tus favoritos ni playlists" },
          ].map((f) => (
            <div key={f.texto} className="modal-premium-feature-item" style={{ opacity: 0.6 }}>
              <span className="modal-premium-feature-icon">{f.icon}</span>
              <div className="modal-premium-feature-titulo">{f.texto}</div>
            </div>
          ))}
        </div>

        <button
  className="modal-premium-btn"
  onClick={onClose}
  style={{ background: '#333', color: '#aaa', cursor: 'pointer', transition: 'all 0.2s' }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = '#444';
    e.currentTarget.style.color = '#fff';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = '#333';
    e.currentTarget.style.color = '#aaa';
  }}
>
  Entendido, hasta pronto
</button>
      </div>
    </div>
  );
}

export default ModalCancelPremium;