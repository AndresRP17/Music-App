import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./styles/Login.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const navigate = useNavigate();

  const [nueva, setNueva] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (nueva.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres.");
      return;
    }
    if (nueva !== repetir) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setCargando(true);

    try {
      // En Netlify (demo) no hay backend: solo se simula
      if (!window.location.hostname.includes("netlify")) {
        await axios.post("/api/music_users/reset-password", {
          token,
          newPassword: nueva,
        });
      }
      setExito(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo actualizar la contraseña."
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0d0d0d",
        padding: 24,
      }}
    >
      <div className="login-box">
        <div className="login-header">
          <h2>Nueva contraseña</h2>
          <p>Elegí una contraseña nueva para tu cuenta.</p>
        </div>

        {!token && (
          <div className="login-error-alert">
            El link no es válido. Pedí uno nuevo desde el login.
          </div>
        )}
        {error && <div className="login-error-alert">{error}</div>}
        {exito && (
          <div className="register-success-alert">
            ¡Contraseña actualizada! Te llevamos al login...
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-input-group">
            <label>Nueva contraseña</label>
            <input
              type="password"
              value={nueva}
              onChange={(e) => setNueva(e.target.value)}
              placeholder="Mínimo 5 caracteres"
              required
              disabled={cargando || exito || !token}
            />
          </div>

          <div className="login-input-group">
            <label>Repetir contraseña</label>
            <input
              type="password"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              required
              disabled={cargando || exito || !token}
            />
          </div>

          <button
            type="submit"
            disabled={cargando || exito || !token}
            className="login-submit-btn"
          >
            {cargando ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>

        <p className="auth-switch">
          <button
            type="button"
            className="auth-link"
            onClick={() => navigate("/")}
          >
            Volver al login
          </button>
        </p>
      </div>
    </div>
  );
}