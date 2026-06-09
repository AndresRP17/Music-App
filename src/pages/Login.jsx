// src/pages/Login.jsx
import { useState } from "react";
import axios from "axios";
import "./Login.css"; // 

export default function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1.  BYPASS REVOLUCIONARIO PARA NETLIFY (Modo Demo)
    // Si la web está corriendo en Netlify, no intentamos conectar al backend local
    if (window.location.hostname.includes("netlify")) {
      setCargando(true);
      
      // Simulamos una pequeña demora de 1 segundo para que se vea el "Validando..." y quede más real
      setTimeout(() => {
        const tokenFalso = "token-demo-netlify-2026";
        
        // Guardamos las credenciales ficticias para que tu App y Sidebar no pinchen
        localStorage.setItem("token", tokenFalso);
        localStorage.setItem("role", "admin"); 
        localStorage.setItem("id", "999");
        localStorage.setItem("logo", "yuuta.jpg"); // Para evitar llamadas rotas a localhost en el logo

        setToken(tokenFalso); // Esto le avisa a tu App.jsx que ya estás adentro
        setCargando(false);
      }, 1000);
      
      return; // Frenamos acá para que no salte al bloque try-catch real
    }

    // 2. CÓDIGO REAL PARA TU COMPU (Localhost)
    if (password.length < 4) {
      setError("La contraseña debe tener al menos 4 caracteres, che.");
      return;
    }

    setCargando(true);

    try {
      const response = await axios.post("/api/music_users/login", {
        email: email,
        password: password,
      });
      console.log(response.data);

      const tokenRecibido = response.data.token;
      const rolRecibido = response.data.role;
      const idRecibido = response.data.id;

      if (tokenRecibido) {
        localStorage.setItem("token", tokenRecibido);
        localStorage.setItem('role', rolRecibido); 
        localStorage.setItem("id", idRecibido);

        setToken(tokenRecibido);
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


// src/pages/Login.jsx
/*import { useState } from "react";
import axios from "axios";
import "./Login.css"; // 

export default function Login({ setToken }) {
 const [email, setEmail] = useState("");
 const [password, setPassword] = useState("");
 const [error, setError] = useState("");
 const [cargando, setCargando] = useState(false);

 const handleSubmit = async (e) => {
 e.preventDefault();
 setError("");

 if (password.length < 4) {
 setError("La contraseña debe tener al menos 4 caracteres, che.");
 return;
 }
 setCargando(true);

 try {
 // 🚀 Corregido para usar tu Proxy /api y evitar problemas de puertos
 const response = await axios.post("/api/music_users/login", {
 email: email,
 password: password,
 });
 console.log(response.data);


 const tokenRecibido = response.data.token;
 const rolRecibido = response.data.role;
 const idRecibido = response.data.id;

 if (tokenRecibido) {
 localStorage.setItem("token", tokenRecibido);
 localStorage.setItem('role', rolRecibido); 
 localStorage.setItem("id", idRecibido); // ← y esto
// ← agregás esto

 setToken(tokenRecibido);
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
 };*/

 return (
 <div className="login-split-container">
 
 {/* LADO IZQUIERDO: Imagen premium de fondo */}
 <div className="login-image-side">
 <div className="login-image-overlay">
 <h2>MusicApp</h2>
 <p>Tu música, tus álbumes, tu espacio personal.</p>
 </div>
 </div>
 {/* LADO DERECHO: El formulario centrado */}
 <div className="login-form-side">
 <div className="login-box">
 
 <div className="login-header">
 <h2>¡Hola de nuevo!</h2>
 <p>Ingresa tus datos para acceder a tu cuenta.</p>
 </div>
 {/* Alerta de error estilizada */}
 {error && <div className="login-error-alert">{error}</div>}

 <form onSubmit={handleSubmit} className="login-form">
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

  <button type="submit" disabled={cargando} className="login-submit-btn">
 {cargando ? "Validando..." : "Iniciar Sesión"}
</button>

{/* Agregá esto */}
<p style={{ textAlign: 'center', marginTop: '16px' }}>
 ¿No tenés cuenta?{" "}
 <a href="/register" style={{ color: '#6c63ff' }}>Registrate acá</a>
</p>
     </form>

    </div>
   </div>

  </div>
 );
}