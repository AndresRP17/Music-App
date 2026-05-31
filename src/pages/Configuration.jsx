import { useState, useEffect } from "react";
import "./Configuration.css";

function Configuracion() {
  const [logoPreview, setLogoPreview] = useState(null);
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const token = localStorage.getItem("token");

  // Mostrar el logo actual al entrar
  useEffect(() => {
    const logoGuardado = localStorage.getItem("logo");
    if (logoGuardado) setLogoPreview(`http://localhost:8086/${logoGuardado}`);
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setArchivo(file);
    setLogoPreview(URL.createObjectURL(file)); // preview instantáneo
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
      console.log(data);

      if (res.ok) {
        localStorage.setItem("logo", data.logo); 
            window.dispatchEvent(new Event("logoActualizado")); // ← agregás esto
// guardás la nueva ruta
        setMensaje("✅ Logo actualizado!");
      } else {
        setMensaje("❌ Error al subir el logo");
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
    </div>
  );
}

export default Configuracion;