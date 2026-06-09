import { useState, useEffect } from "react";
import "./Configuration.css";

function Configuracion() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");
  const [esPremium, setEsPremium] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  useEffect(() => {
    const logoGuardado = localStorage.getItem(`logo_${userId}`);
    if (logoGuardado) setLogoPreview(`http://localhost:8086/${logoGuardado}`);

    const premiumGuardado = localStorage.getItem("esPremium") === "true";
    setEsPremium(premiumGuardado);
  }, []);

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

  const activarPremium = () => {
    localStorage.setItem("esPremium", "true");
    setEsPremium(true);
    setMensaje("🌟 ¡Ahora sos Premium! Sin anuncios.");
  };

  const cancelarPremium = () => {
    localStorage.setItem("esPremium", "false");
    setEsPremium(false);
    setMensaje("Plan cambiado a gratuito.");
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

      {/* SECCIÓN PREMIUM */}
      <div className="premium-section">
        {esPremium ? (
          <>
            <div className="premium-badge">🌟 Sos usuario Premium</div>
            <p className="premium-desc">Estás disfrutando de la app sin anuncios.</p>
            <button className="btn-cancelar-premium" onClick={cancelarPremium}>
              Cancelar Premium
            </button>
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