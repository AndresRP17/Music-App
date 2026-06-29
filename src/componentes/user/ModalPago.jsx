import { useState } from "react";
import "./styles/ModalPago.css";

const formatCardNumber = (val) =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
};

const formatCVV = (val) => val.replace(/\D/g, "").slice(0, 3);

function detectBrand(number) {
  const n = number.replace(/\s/g, "");
  if (n.startsWith("4")) return "VISA";
  if (n.startsWith("5")) return "MASTERCARD";
  if (n.startsWith("3")) return "AMERICAN";
  if (n.startsWith("1")) return "MERCADOPAGO";
  return null;
}

function ModalPago({ onCerrar, onPagoExitoso }) {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ numero: "", nombre: "", expiry: "", cvv: "" });
  const [errores, setErrores] = useState({});

  const brand = detectBrand(form.numero);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === "numero") formatted = formatCardNumber(value);
    if (name === "expiry") formatted = formatExpiry(value);
    if (name === "cvv") formatted = formatCVV(value);
    setForm((prev) => ({ ...prev, [name]: formatted }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = () => {
    const nuevos = {};

    const digits = form.numero.replace(/\s/g, "");
    if (digits.length < 16) nuevos.numero = "Número inválido";

    if (!form.nombre.trim()) nuevos.nombre = "Ingresá el nombre";

    // Validación de fecha: acepta cualquier fecha futura
    const [mm, yy] = form.expiry.split("/");
    const mesNum  = parseInt(mm);
    const anioNum = parseInt("20" + yy);
    const ahora      = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual  = ahora.getMonth() + 1;

    if (
      !mm || !yy ||
      isNaN(mesNum) || isNaN(anioNum) ||
      mesNum < 1 || mesNum > 12 ||
      anioNum < anioActual ||
      (anioNum === anioActual && mesNum < mesActual)
    ) {
      nuevos.expiry = "Tarjeta vencida o fecha inválida";
    }

    if (form.cvv.length < 3) nuevos.cvv = "CVV inválido";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  const handleSubmit = () => {
    if (!validar()) return;
    setStep("procesando");
    setTimeout(() => {
      setStep("exito");
      setTimeout(() => {
        const ultimos = form.numero.replace(/\s/g, "").slice(-4);
        onPagoExitoso(ultimos, brand || "OTRO");
        onCerrar();
      }, 2000);
    }, 2500);
  };

  return (
    <div className="mpago-overlay" onClick={onCerrar}>
      <div className="mpago-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mpago-header">
          <div>
            <p className="mpago-eyebrow">Plan Premium</p>
            <h2 className="mpago-title">Completá tu suscripción</h2>
          </div>
          <button className="mpago-cerrar" onClick={onCerrar}>×</button>
        </div>

        {/* Precio */}
        <div className="mpago-precio-row">
          <div className="mpago-precio-info">
            <span className="mpago-precio-label">Premium mensual</span>
            <span className="mpago-precio-desc">Sin anuncios · Playlists · Favoritos</span>
          </div>
          <span className="mpago-precio-valor">$1.99<span>/mes</span></span>
        </div>

        {/* Tarjeta visual */}
        <div className={`mpago-card-visual ${brand ? "mpago-card-visual--" + brand.toLowerCase() : ""}`}>
          <div className="mpago-card-chip">
            <div className="mpago-chip-inner" />
          </div>
          <div className="mpago-card-number">
            {form.numero || "•••• •••• •••• ••••"}
          </div>
          <div className="mpago-card-bottom">
            <div>
              <span className="mpago-card-label">Titular</span>
              <span className="mpago-card-val">{form.nombre || "TU NOMBRE"}</span>
            </div>
            <div>
              <span className="mpago-card-label">Vence</span>
              <span className="mpago-card-val">{form.expiry || "MM/AA"}</span>
            </div>
            {brand && <span className="mpago-brand">{brand}</span>}
          </div>
        </div>

        {step === "form" && (
          <div className="mpago-form">
            <div className="mpago-field">
              <label>Número de tarjeta</label>
              <input
                name="numero"
                value={form.numero}
                onChange={handleChange}
                placeholder="1234 5678 9012 3456"
                className={errores.numero ? "mpago-input--error" : ""}
              />
              {errores.numero && <span className="mpago-error">{errores.numero}</span>}
            </div>

            <div className="mpago-field">
              <label>Nombre en la tarjeta</label>
              <input
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="JUAN PEREZ"
                style={{ textTransform: "uppercase" }}
                className={errores.nombre ? "mpago-input--error" : ""}
              />
              {errores.nombre && <span className="mpago-error">{errores.nombre}</span>}
            </div>

            <div className="mpago-row">
              <div className="mpago-field">
                <label>Vencimiento</label>
                <input
                  name="expiry"
                  value={form.expiry}
                  onChange={handleChange}
                  placeholder="MM/AA"
                  className={errores.expiry ? "mpago-input--error" : ""}
                />
                {errores.expiry && <span className="mpago-error">{errores.expiry}</span>}
              </div>
              <div className="mpago-field">
                <label>CVV</label>
                <input
                  name="cvv"
                  value={form.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  type="password"
                  className={errores.cvv ? "mpago-input--error" : ""}
                />
                {errores.cvv && <span className="mpago-error">{errores.cvv}</span>}
              </div>
            </div>

            <button className="mpago-btn-pagar" onClick={handleSubmit}>
              Pagar $1.99 y activar Premium
            </button>

            <p className="mpago-disclaimer">
              🔒 Pago simulado — no se realizan cargos reales
            </p>
          </div>
        )}

        {step === "procesando" && (
          <div className="mpago-estado">
            <div className="mpago-spinner" />
            <p>Procesando pago...</p>
            <span>No cerrés esta ventana</span>
          </div>
        )}

        {step === "exito" && (
          <div className="mpago-estado">
            <div className="mpago-check">✓</div>
            <p>¡Pago exitoso!</p>
            <span>Activando tu cuenta Premium...</span>
          </div>
        )}

      </div>
    </div>
  );
}

export default ModalPago;
