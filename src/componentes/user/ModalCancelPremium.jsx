import "./styles/ModalBienvenida.css"; // reutilizás el mismo CSS base

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
            { icon: "💔", texto: "La app no será lo mismo sin vos" },
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
          style={{ background: '#333', color: '#aaa' }}
        >
          Entendido, hasta pronto 👋
        </button>
      </div>
    </div>
  );
}

export default ModalCancelPremium;