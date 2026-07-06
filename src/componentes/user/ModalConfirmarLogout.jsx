import { createPortal } from "react-dom";
import { FiLogOut } from "react-icons/fi";
import "./styles/ModalConfirmarLogout.css"

function ModalConfirmarLogout({ onConfirmar, onCancelar }) {
  return createPortal(
    <div className="modal-logout-overlay" onClick={onCancelar}>
      <div className="modal-logout-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-logout-icon">
          <FiLogOut />
        </div>
        <h3 className="modal-logout-titulo">¿Estás seguro?</h3>
        <p className="modal-logout-texto">
          Vas a cerrar tu sesión en MusicApp.
        </p>
        <div className="modal-logout-botones">
          <button
            onClick={onConfirmar}
            className="modal-logout-btn modal-logout-btn--confirmar"
          >
            Sí, salir
          </button>
          <button
            onClick={onCancelar}
            className="modal-logout-btn modal-logout-btn--cancelar"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ModalConfirmarLogout;