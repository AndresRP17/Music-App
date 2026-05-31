import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres.");
      return;
    }

    setCargando(true);

    try {
      await axios.post("/api/music_users", {
        email,
        password,
        role: "user"
      });

      setExito(true);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Error al registrarse.");
      } else {
        setError("No se pudo conectar con el servidor.");
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-split-container">
      <div className="login-image-side">
        <div className="login-image-overlay">
          <h2>MusicApp</h2>
          <p>Tu música, tus álbumes, tu espacio personal.</p>
        </div>
      </div>

      <div className="login-form-side">
        <div className="login-box">
          <div className="login-header">
            <h2>Crear cuenta</h2>
            <p>Ingresá tus datos para registrarte.</p>
          </div>

          {error && <div className="login-error-alert">{error}</div>}

          {exito && (
            <div style={{
              background: '#d4edda',
              color: '#155724',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '16px'
            }}>
              ✅ ¡Usuario creado con éxito! Redirigiendo...
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={cargando || exito}
              />
            </div>

            <div className="login-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese una clave"
                required
                disabled={cargando || exito}
              />
            </div>

            <button type="submit" disabled={cargando || exito} className="login-submit-btn">
              {cargando ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '16px' }}>
            ¿Ya tenés cuenta?{" "}
            <a href="/" style={{ color: '#6c63ff' }}>Iniciá sesión</a>
          </p>
        </div>
      </div>
    </div>
  );
}