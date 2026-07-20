import { FaHeart } from "react-icons/fa";

function ModalFidelidad({ onCerrar }) {
  const role = localStorage.getItem("role") || "user";
  const esPremium = role === "premium" || role === "admin";
  const color = esPremium ? "#d0b412" : "#b80f0f";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 2000,
      }}
      onClick={onCerrar}
    >
      <div
        style={{
          background: "#1a1a1a",
          borderRadius: "16px",
          padding: "40px 32px",
          maxWidth: "360px",
          textAlign: "center",
          border: `1px solid ${color}66`,
          boxShadow: `0 0 40px ${color}33`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <FaHeart style={{ fontSize: "48px", color, marginBottom: "16px" }} />
        <h2 style={{ color, marginBottom: "12px" }}>¡Gracias por tu fidelidad!</h2>
        <p style={{ color: "#ccc", fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}>
          Ya superaste los 100 minutos escuchando música en MusicApp.
          Nos encanta que la música te acompañe. 🎶
        </p>
        <button
          onClick={onCerrar}
          style={{
            background: color,
            border: "none",
            borderRadius: "8px",
            padding: "10px 28px",
            color: "#000",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Seguir escuchando
        </button>
      </div>
    </div>
  );
}

export default ModalFidelidad;