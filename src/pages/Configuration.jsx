import { useState, useEffect } from "react";
import "./Configuration.css";

function Configuracion() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  
  // Guardamos el ROL real que viene de la base de datos ('user', 'premium', 'admin')
  const [role, setRole] = useState("user");

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const logoGuardado = localStorage.getItem(`logo_${userId}`);
    if (logoGuardado) setLogoPreview(`http://localhost:8086/${logoGuardado}`);

    // Traemos el rol del localStorage (asegurate de guardarlo al loguearte)
    const rolGuardado = localStorage.getItem("role") || "user";
    setRole(rolGuardado);
  }, [userId]);

  // Constante auxiliar: sos premium si tu rol es 'premium' O si sos 'admin'
  const esPremiumOAdmin = role === "premium" || role === "admin";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!archivo) return setMensaje("Seleccioná una imagen primero");

    const formData = new FormData();
    formData.append("logo", archivo);
    formData.append("token", token);

    try {
      const res = await fetch(`/api/music_users/logo`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem(`logo_${userId}`, data.logo);
        window.dispatchEvent(new Event("logoActualizado"));
        setMensaje("✅ Logo actualizado!");
      } else {
        setMensaje("❌ Error al subir el logo");
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
    }
  };

  const activarPremium = async () => {
  try {
    const res = await fetch('/api/music_users/role', { // Usás el ID del usuario
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token, // Pasás el token si tu service lo pide para validar
        role: "premium"
      })
    });

    if (res.ok) {
      localStorage.setItem("role", "premium");
      setRole("premium");
      window.dispatchEvent(new Event("rolActualizado"));
      setMensaje("🌟 ¡Ahora sos Premium! Sin anuncios.");
    }
  } catch (error) {
    setMensaje("❌ Error de conexión");
  }
};

 // LLAMADA REAL AL BACKEND PARA VOLVER A PLAN GRATUITO ('user')
  const cancelarPremium = async () => {
    try {
      const res = await fetch('/api/music_users/role', {
        method: "POST", // En mayúscula por buena práctica
        headers: {
          "Content-Type": "application/json",
        },
        // !!! TE FALTABA ESTO DE ACÁ ABAJO !!!
        body: JSON.stringify({
          token: token,   // El token de localStorage para saber quién es el usuario
          role: "user"    // El rol que querés que se guarde ahora en la base de datos
        })
      });

      if (res.ok) {
        localStorage.setItem("role", "user");
        setRole("user");
        setMensaje("Plan cambiado a gratuito.");
      } else {
        setMensaje("❌ No se pudo cancelar el plan");
      }
    } catch (error) {
      setMensaje("❌ Error de conexión");
    }
  };

  return (
    <div className="configuracion">
      <h2>Configuración</h2>

      <div className="logo-section">
        <img
          src={logoPreview || "/yuuta.jpg"}
          alt="Logo actual"
          className="logo-preview"
        />
        <label className="upload-label">
          Elegir imagen
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
          />
        </label>
        <button onClick={handleUpload}>Guardar logo</button>
        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>

      {/* SECCIÓN PREMIUM ADAPTADA */}
      <div className="premium-section">
        {esPremiumOAdmin ? (
          <>
            <div className="premium-badge">
              {role === "admin" ? "🛠️ Cuenta Administrador" : "🌟 Sos usuario Premium"}
            </div>
            <p className="premium-desc">
              {role === "admin" 
                ? "Tenés acceso total a la app por ser Administrador." 
                : "Estás disfrutando de la app sin anuncios."}
            </p>
            
            {/* Si es Admin, no le dejamos ver el botón de cancelar su suscripción */}
            {role !== "admin" && (
              <button className="btn-cancelar-premium" onClick={cancelarPremium}>
                Cancelar Premium
              </button>
            )}
          </>
        ) : (
          <>
            <div className="premium-badge free">🎵 Plan Gratuito</div>
            <p className="premium-desc">
              Actualizate a Premium y olvidate de los anuncios para siempre.
            </p>
            <button className="btn-premium" onClick={activarPremium}>
              ⭐ Hacerse Premium
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Configuracion;