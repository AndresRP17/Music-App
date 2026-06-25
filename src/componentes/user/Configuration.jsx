import { useState, useEffect } from "react";
import "./styles/Configuration.css";

function Configuracion() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [logoPreview, setLogoPreview] = useState(() => {
    const logo = localStorage.getItem(`logo_${userId}`);
    return logo ? `http://localhost:8086/${logo}` : null;
  });

  useEffect(() => {
    // acá dejás solo lo que SÍ necesita el effect, por ejemplo fetches al backend
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
    } catch {
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
  } catch  {
    setMensaje("❌ Error de conexión");
  }
};

const cancelarPremium = async () => {
  try {
    console.log("Enviando petición de cancelación...");
    
    const res = await fetch('/api/music_users/role', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token,   // Asegurate de que esta variable 'token' tenga el valor real
        role: "user"
      })
    });

    console.log("Respuesta del servidor recibida. Status:", res.status);

    if (res.ok) {
  console.log("¡Petición exitosa! Actualizando estados...");
  localStorage.setItem("role", "user");
  setRole("user");
  setMensaje("Plan cambiado a gratuito.");
  
  // 🌟 DISPARÁS EL MISMO NOMBRE QUE ESCUCHA TU SIDEBAR:
  window.dispatchEvent(new Event("rolActualizado")); 

    } else {
      const errorData = await res.json();
      console.log("El servidor respondió con error:", errorData);
      setMensaje("❌ No se pudo cancelar el plan");
    }
  } catch (error) {
    console.error("Error en la conexión del fetch:", error);
    setMensaje("❌ Error de conexión");
  }
};

  return (
    <div className="configuracion">
      <h2 style={{ color: role === "premium" || role === "admin" ? '#d0b412' : '' }}>Configuración</h2>

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