
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
    // En Netlify usamos la preview local en base64 u objectURL, si no busca localhost
    return logo ? (logo.startsWith("blob:") || logo.startsWith("data:") ? logo : `http://localhost:8086/${logo}`) : null;
  });

  useEffect(() => {
    // Acá dejás solo lo que SÍ necesita el effect, por ejemplo fetches al backend
  }, [userId]);

  const esPremiumOAdmin = role === "premium" || role === "admin";

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!archivo) return setMensaje("Seleccioná una imagen primero");

    // 🌟 BYPASS LOGO PARA NETLIFY (Modo Demo)
    if (window.location.hostname.includes("netlify")) {
      const fakeUrl = URL.createObjectURL(archivo);
      localStorage.setItem(`logo_${userId}`, fakeUrl);
      window.dispatchEvent(new Event("logoActualizado"));
      setMensaje("✅ Logo actualizado! (Modo Demo)");
      return;
    }

    // 🖥️ CÓDIGO REAL PARA LOCALHOST
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
    // 🌟 BYPASS PARA NETLIFY (Modo Demo)
    if (window.location.hostname.includes("netlify")) {
      localStorage.setItem("role", "premium");
      setRole("premium");
      window.dispatchEvent(new Event("rolActualizado"));
      setMensaje("🌟 ¡Ahora sos Premium! Sin anuncios. (Modo Demo)");
      return;
    }

    // 🖥️ CÓDIGO REAL PARA LOCALHOST
    try {
      const res = await fetch('/api/music_users/role', {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, role: "premium" })
      });

      if (res.ok) {
        localStorage.setItem("role", "premium");
        setRole("premium");
        window.dispatchEvent(new Event("rolActualizado"));
        setMensaje("🌟 ¡Ahora sos Premium! Sin anuncios.");
      }
    } catch {
      setMensaje("❌ Error de conexión");
    }
  };

  const cancelarPremium = async () => {
    // 🌟 BYPASS PARA NETLIFY (Modo Demo)
    if (window.location.hostname.includes("netlify")) {
      localStorage.setItem("role", "user");
      setRole("user");
      window.dispatchEvent(new Event("rolActualizado"));
      setMensaje("Plan cambiado a gratuito. (Modo Demo)");
      return;
    }

    // 🖥️ CÓDIGO REAL PARA LOCALHOST (Limpiado y corregido sin errores de sintaxis)
    try {
      console.log("Enviando petición de cancelación...");
      const res = await fetch('/api/music_users/role', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, role: "user" })
      });

      if (res.ok) {
        localStorage.setItem("role", "user");
        setRole("user");
        setMensaje("Plan cambiado a gratuito.");
        window.dispatchEvent(new Event("rolActualizado")); 
      } else {
        setMensaje("❌ No se pudo cancelar el plan");
      }
    } catch (error) {
      console.error("Error en la conexión del fetch:", error);
      setMensaje("❌ Error de conexión");
    }
  };

  return (
    <div className="configuration-container">
      <h2>Configuración de Cuenta</h2>
      {mensaje && <p className="config-message">{mensaje}</p>}
      
      <div className="config-section">
        <h3>Foto de Perfil</h3>
        {logoPreview && <img src={logoPreview} alt="Preview" className="logo-preview-img" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px' }} />}
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button onClick={handleUpload} className="config-btn">Actualizar Foto</button>
      </div>

      <div className="config-section">
        <h3>Suscripción</h3>
        <p>Rol actual: <strong style={{ color: esPremiumOAdmin ? '#d0b412' : '#fff' }}>{role.toUpperCase()}</strong></p>
        {role === "user" ? (
          <button onClick={activarPremium} className="config-btn premium-btn" style={{ background: '#d0b412', color: '#000', fontWeight: 'bold' }}>
            👑 Hacerse Premium
          </button>
        ) : role === "premium" ? (
          <button onClick={cancelarPremium} className="config-btn cancel-btn">
            Cancelar Suscripción Premium
          </button>
        ) : (
          <p style={{ color: '#aaa', fontSize: '0.9rem' }}>Sos Administrador. Tenés acceso total.</p>
        )}
      </div>
    </div>
  );
}

export default Configuracion;