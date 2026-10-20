import { useState } from "react";
import axios from "axios";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import AvisoProyecto from "./AvisoProyecto";
import "./styles/Login.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const esProd = window.location.hostname.includes("netlify");

export default function Login({ setToken, setRole, initialMode = "login" }) {
  const [modo, setModo] = useState(initialMode); // "login" | "register"
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);
  const [exitoGoogle, setExitoGoogle] = useState(false); // cuenta creada con Google
  const [olvido, setOlvido] = useState(false); // "¿Olvidaste tu contraseña?"
  const [mensajeOk, setMensajeOk] = useState("");

  // Campos del login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Campos del registro
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const esRegistro = modo === "register";

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo);
    setError("");
    setExito(false);
    setExitoGoogle(false);
    setOlvido(false);
    setMensajeOk("");
  };

  const abrirOlvido = () => {
    setOlvido(true);
    setError("");
    setMensajeOk("");
  };

  const cerrarOlvido = () => {
    setOlvido(false);
    setError("");
    setMensajeOk("");
  };

  const iniciarSesion = ({ token, role, id, logo, provider }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("id", id);
    localStorage.setItem("provider", provider || "local");
    if (logo) localStorage.setItem("logo", logo);
    setToken(token);
    setRole(role);
  };

  const sesionDemo = () => {
    setCargando(true);
    setTimeout(() => {
      localStorage.clear();
      iniciarSesion({
        token: "token-demo-netlify-2026",
        role: "user",
        id: "999",
        logo: "yuuta.jpg",
        provider: "local",
      });
      setCargando(false);
    }, 1000);
  };

  // ---------- LOGIN ----------
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Bypass para Netlify (modo demo)
    if (esProd) {
      sesionDemo();
      return;
    }

    // 2. localhost
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres, che.");
      return;
    }

    setCargando(true);

    try {
      const { data } = await axios.post("/api/music_users/login", {
        email,
        password,
      });

      if (data.token) {
        iniciarSesion({
          token: data.token,
          role: data.role,
          id: data.id,
          provider: data.provider,
        });
      } else {
        setError("El backend no devolvió un token válido.");
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message || "Credenciales incorrectas.");
      } else {
        setError("No se pudo conectar con el servidor. ¿Está prendido el backend?");
      }
    } finally {
      setCargando(false);
    }
  };

  // ---------- REGISTER ----------
  const volverAlLogin = (emailRegistrado) => {
    setModo("login");
    setExito(false);
    setEmail(emailRegistrado);
    setPassword("");
    setRegPassword("");
    setMensajeOk(
      "¡Cuenta creada con éxito! Ahora iniciá sesión con tu email y contraseña."
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (regPassword.length < 5) {
      setError("La contraseña debe tener al menos 5 caracteres.");
      return;
    }

    setCargando(true);

    // Bypass Netlify (igual que en el login)
    if (esProd) {
      setTimeout(() => {
        setExito(true);
        setCargando(false);
        setTimeout(() => volverAlLogin(regEmail), 2000);
      }, 1000);
      return;
    }

    try {
      await axios.post("/api/music_users", {
        email: regEmail,
        password: regPassword,
        role: "user",
      });

      setExito(true);
      setTimeout(() => volverAlLogin(regEmail), 2000);
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

  // ---------- OLVIDÉ MI CONTRASEÑA ----------
  const handleOlvido = async (e) => {
    e.preventDefault();
    setError("");
    setMensajeOk("");
    setCargando(true);

    try {
      // En Netlify (demo) no hay backend: solo se simula
      if (!esProd) {
        await axios.post("/api/music_users/forgot-password", { email });
      }
      setMensajeOk(
        "Si el mail está registrado, te enviamos un link para elegir una nueva contraseña."
      );
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo procesar el pedido.");
    } finally {
      setCargando(false);
    }
  };

  // ---------- GOOGLE ----------
  // Sirve para login y registro: si el email no existe, el backend lo crea.
  const handleGoogle = async (credentialResponse) => {
    setError("");

    if (esProd) {
      if (esRegistro) {
        setExito(true);
        setExitoGoogle(true);
        setTimeout(sesionDemo, 2000);
      } else {
        sesionDemo();
      }
      return;
    }

    setCargando(true);
    try {
      const { data } = await axios.post("/api/music_users/google", {
        credential: credentialResponse.credential,
        register: esRegistro,
      });

      if (data.token) {
        const sesion = {
          token: data.token,
          role: data.role,
          id: data.id,
          logo: data.logo,
          provider: data.provider,
        };

        if (esRegistro) {
          // Cuenta nueva: se muestra el aviso antes de entrar a la app
          setExito(true);
          setExitoGoogle(true);
          setTimeout(() => iniciarSesion(sesion), 2500);
        } else {
          iniciarSesion(sesion);
        }
      } else {
        setError("El backend no devolvió un token válido.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "No se pudo ingresar con Google."
      );
    } finally {
      setCargando(false);
    }
  };

  const botonGoogle = (texto) =>
    GOOGLE_CLIENT_ID && (
      <>
        <div className="auth-divider">
          <span>o</span>
        </div>
        <div className="auth-google">
          <GoogleLogin
            onSuccess={handleGoogle}
            onError={() => setError("No se pudo ingresar con Google.")}
            theme="filled_black"
            shape="rectangular"
            text={texto}
            locale="es"
            width="340"
          />
        </div>
      </>
    );

  const contenido = (
    <div className={`auth-page ${esRegistro ? "is-register" : ""}`}>
    <div className={`auth-container ${esRegistro ? "is-register" : ""}`}>
      {/* PANEL CURVO: se desliza de un lado al otro */}
      <div className="auth-image-panel">
        <div className="auth-image-layer auth-image-login">
          <div className="login-image-overlay">
            <div className="auth-vinyl" />
            <h2>¡Bienvenido!</h2>
            <p>Tu música, tus álbumes, tu espacio personal.</p>
            <button
              type="button"
              className="auth-ghost-btn"
              onClick={() => cambiarModo("register")}
            >
              Registrarse
            </button>
          </div>
        </div>
        <div className="auth-image-layer auth-image-register">
          <div className="login-image-overlay">
            <div className="auth-vinyl" />
            <h2>¡Hola!</h2>
            <p>¿Ya tenés cuenta? Iniciá sesión y seguí con tu música.</p>
            <button
              type="button"
              className="auth-ghost-btn"
              onClick={() => cambiarModo("login")}
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>

      {/* FORMULARIO LOGIN (lado izquierdo) */}
      <div className="auth-form-panel auth-form-login">
        <div className="login-box">
          <div className="login-header">
            <h2>{olvido ? "Recuperar contraseña" : "¡Hola de nuevo!"}</h2>
            <p>
              {olvido
                ? "Ingresá tu mail y te mandamos un link para elegir una nueva."
                : "Ingresa tus datos para acceder a tu cuenta."}
            </p>
          </div>

          {!esRegistro && error && (
            <div className="login-error-alert">{error}</div>
          )}

          {!esRegistro && mensajeOk && (
            <div className="register-success-alert">{mensajeOk}</div>
          )}

          {olvido ? (
            <form onSubmit={handleOlvido} className="login-form">
              <div className="login-input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={cargando}
                />
              </div>

              <button type="submit" disabled={cargando} className="login-submit-btn">
                {cargando ? "Enviando..." : "Enviar link"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="login-form">
              <div className="login-input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  disabled={cargando}
                />
              </div>

              <div className="login-input-group">
                <label>Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu clave"
                  required
                  disabled={cargando}
                />
              </div>

              <button
                type="button"
                className="auth-link auth-forgot"
                onClick={abrirOlvido}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <button type="submit" disabled={cargando} className="login-submit-btn">
                {cargando && !esRegistro ? "Validando..." : "Iniciar Sesión"}
              </button>
            </form>
          )}

          {!esRegistro && !olvido && botonGoogle("signin_with")}

          <p className="auth-switch">
            {olvido ? (
              <button type="button" className="auth-link" onClick={cerrarOlvido}>
                Volver al login
              </button>
            ) : (
              <span className="auth-mobile-only">
                ¿No tenés cuenta?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => cambiarModo("register")}
                >
                  Registrate acá
                </button>
              </span>
            )}
          </p>
        </div>
      </div>

      {/* FORMULARIO REGISTER (lado derecho) */}
      <div className="auth-form-panel auth-form-register">
        <div className="login-box">
          <div className="login-header">
            <h2>Crear cuenta</h2>
            <p>Ingresá tus datos para registrarte.</p>
          </div>

          {esRegistro && error && (
            <div className="login-error-alert">{error}</div>
          )}

          {exito && (
            <div className="register-success-alert">
              {exitoGoogle
                ? "¡Cuenta creada con Google! Entrando a MusicApp..."
                : "¡Usuario creado con éxito! Te llevamos al login..."}
            </div>
          )}

          <form onSubmit={handleRegister} className="login-form">
            <div className="login-input-group">
              <label>Email</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={cargando || exito}
              />
            </div>

            <div className="login-input-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Mínimo 5 caracteres"
                required
                disabled={cargando || exito}
              />
            </div>

            <button
              type="submit"
              disabled={cargando || exito}
              className="login-submit-btn"
            >
              {cargando && esRegistro ? "Registrando..." : "Crear cuenta"}
            </button>
          </form>

          {esRegistro && !exito && botonGoogle("signup_with")}

          <p className="auth-switch">
            <span className="auth-mobile-only">
              ¿Ya tenés cuenta?{" "}
              <button
                type="button"
                className="auth-link"
                onClick={() => cambiarModo("login")}
              >
                Iniciá sesión
              </button>
            </span>
          </p>
        </div>
      </div>
    </div>
    <AvisoProyecto />
    </div>
  );

  return GOOGLE_CLIENT_ID ? (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {contenido}
    </GoogleOAuthProvider>
  ) : (
    contenido
  );
}
