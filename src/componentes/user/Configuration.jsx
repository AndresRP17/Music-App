import { useState, useEffect } from "react";
import ModalPremiumBienvenida from "./ModalBienvenida";
import ModalCancelPremium from "./ModalCancelPremium";
import ModalPago from "./ModalPago";
import "./styles/Configuration.css";

function Configuracion() {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("id");

  const [archivo, setArchivo] = useState(null);
  const [mostrarModalPremium, setMostrarModalPremium] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mostrarModalCancel, setMostrarModalCancel] = useState(false);
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [role, setRole] = useState(localStorage.getItem("role") || "user");
  const [logoPreview, setLogoPreview] = useState(() => {
    const logo = localStorage.getItem(`logo_${userId}`);
    return logo ? `http://localhost:8086/${logo}` : null;
  });

  useEffect(() => {
    // acá dejás solo lo que SÍ necesita el effect, por ejemplo fetches al backend
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

  // Ahora solo abre el modal de pago
  const activarPremium = () => {
    setMostrarModalPago(true);
  };

  // Se llama desde ModalPago cuando el pago es exitoso
 const onPagoExitoso = async (ultimos, marca) => {
  if (window.location.hostname.includes("netlify")) {
    localStorage.setItem("role", "premium");
    setRole("premium");
    setMostrarModalPremium(true);
    window.dispatchEvent(new Event("rolActualizado"));
    return;
  }

  try {
    const res = await fetch('/api/pagos', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        monto: "1.99",
        ultimos: ultimos,
        marca: marca
      })
    });

    if (res.ok) {
      localStorage.setItem("role", "premium");
      setRole("premium");
      setMostrarModalPremium(true);
      window.dispatchEvent(new Event("rolActualizado"));
      setMensaje("🌟 ¡Ahora sos Premium! Sin anuncios.");
    }
  } catch {
    setMensaje("❌ Error de conexión");
  }
};

  const cancelarPremium = async () => {
    if (window.location.hostname.includes("netlify")) {
      localStorage.setItem("role", "user");
      setRole("user");
      window.dispatchEvent(new Event("rolActualizado"));
      setMostrarModalCancel(true);
      return;
    }

    try {
      const res = await fetch('/api/music_users/role', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token, role: "user" })
      });

      if (res.ok) {
        localStorage.setItem("role", "user");
        setRole("user");
        setMensaje("Plan cambiado a gratuito.");
        setMostrarModalCancel(true);
        window.dispatchEvent(new Event("rolActualizado"));
      } else {
        setMensaje("❌ No se pudo cancelar el plan");
      }
    } catch {
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

      {/* Modal de pago */}
      {mostrarModalPago && (
        <ModalPago
          onCerrar={() => setMostrarModalPago(false)}
          onPagoExitoso={onPagoExitoso}
        />
      )}

      {/* Modal de bienvenida premium */}
      {mostrarModalPremium && (
        <ModalPremiumBienvenida
          onClose={() => setMostrarModalPremium(false)}
        />
      )}

      {/* Modal para cancelar premium */}
      {mostrarModalCancel && (
        <ModalCancelPremium
          onClose={() => setMostrarModalCancel(false)}
        />
      )}
    </div>
  );
}

export default Configuracion;