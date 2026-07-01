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
   
  }, [userId]);
  
const esPremiumOAdmin = role === "premium" || role === "admin" || role === "familiar";


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
      } else {
        setMensaje("❌ Error al subir el logo");
      }
    } catch {
      setMensaje("❌ Error de conexión");
    }
  };

  const activarPremium = () => {
    setMostrarModalPago(true);
  };

  const [pagoPendiente, setPagoPendiente] = useState(null);

  const onPagoExitoso = (ultimos, marca, planSeleccionado, periodo) => {
    console.log('🎉 Pago exitoso!');
    console.log('Plan:', planSeleccionado);
    console.log('Período:', periodo);
    console.log('Últimos 4 dígitos:', ultimos);
    console.log('Marca:', marca);

    
    setPagoPendiente({ planSeleccionado });

    setMostrarModalPremium(true);
  };

  const aplicarPremiumYRecargar = () => {
    setMostrarModalPremium(false);

    if (pagoPendiente) {
      const { planSeleccionado } = pagoPendiente;
      const nuevoRole = (planSeleccionado?.id === 'familiar') ? 'premium' : (planSeleccionado?.id || 'premium');

      localStorage.setItem("role", nuevoRole);
      setRole(nuevoRole);

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.plan = nuevoRole;
      user.plan_actualizado = new Date().toISOString();
      localStorage.setItem('user', JSON.stringify(user));

      window.dispatchEvent(new Event("rolActualizado"));
    }

    // Recargamos recién ahora, con todo ya aplicado y visto por el usuario.
  
  };

  const cancelarPremium = async () => {
    if (window.location.hostname.includes("netlify")) {
      localStorage.setItem("role", "user");
      setRole("user");
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.plan = 'user';
      localStorage.setItem('user', JSON.stringify(user));
      
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
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.plan = 'user';
        localStorage.setItem('user', JSON.stringify(user));
        
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
        <button onClick={handleUpload} className="guardado">Guardar imagen</button>
        {mensaje && <p className="mensaje">{mensaje}</p>}
      </div>

      <div className="premium-section">
        {esPremiumOAdmin ? (
          <>
            <div className="premium-badge">
              {role === "admin" ? "Cuenta Administrador" : "Sos usuario Premium"}
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
            <div className="premium-badge free">Plan Gratuito</div>
            <p className="premium-desc">
              Actualizate a Premium y accede a todos los beneficios.
            </p>
            <button className="btn-premium" onClick={activarPremium}>
              Hacerse Premium
            </button>
          </>
        )}
      </div>

      {/* Modal de pago */}
      {mostrarModalPago && (
        <ModalPago
          onCerrar={() => setMostrarModalPago(false)}
          onPagoExitoso={onPagoExitoso}
          userId={userId}  
        />
      )}

      {/* Modal de bienvenida premium */}
      {mostrarModalPremium && (
        <ModalPremiumBienvenida
          onClose={aplicarPremiumYRecargar}
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