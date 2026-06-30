import { useState, useRef } from "react"; 
import "./styles/ModalPago.css";
import jsPDF from "jspdf"; 
import html2canvas from "html2canvas"; 

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
  if (n.startsWith("3")) return "AMERICAN EXPRESS";
  if (n.startsWith("1")) return "MERCADOPAGO";
  return "TARJETA";
}

function ModalPago({ onCerrar, onPagoExitoso }) {
  const [step, setStep] = useState("form");
  const [form, setForm] = useState({ numero: "", nombre: "", expiry: "", cvv: "" });
  const [errores, setErrores] = useState({});
  const [fechaPago, setFechaPago] = useState(null);

  const comprobanteRef = useRef(); 
  const brand = detectBrand(form.numero);

  const descargarPDF = async () => {
    const elemento = comprobanteRef.current;
    if (!elemento) {
      console.error("Elemento del comprobante no encontrado");
      return;
    }

    try {
      // Pequeño delay para asegurar que el contenido se renderice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(elemento, { 
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`comprobante-premium-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Hubo un error al generar el comprobante. Por favor, intenta nuevamente.");
    }
  };

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
    setFechaPago(new Date());
    setTimeout(() => {
      setStep("exito");
    }, 2500);
  };

  const finalizarFlujo = () => {
    const ultimos = form.numero.replace(/\s/g, "").slice(-4);
    onPagoExitoso(ultimos, brand || "OTRO");
    onCerrar();
  };

  // Datos para el comprobante
  const ultimosDigitos = form.numero.replace(/\s/g, "").slice(-4) || "0000";
  const nombreCliente = form.nombre.toUpperCase() || "SUSCRITO PREMIUM";
  const fechaFormateada = fechaPago ? fechaPago.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) : new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="mpago-overlay" onClick={step === "exito" ? finalizarFlujo : onCerrar}>
      <div className="mpago-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mpago-header">
          <div>
            <p className="mpago-eyebrow">Plan Premium, primer mes gratis</p>
            <h2 className="mpago-title">Completá tu suscripción</h2>
          </div>
          <button className="mpago-cerrar"   onClick={step === "exito" ? finalizarFlujo : onCerrar}
>×</button>
        </div>

        {/* Precio */}
        <div className="mpago-precio-row">
          <div className="mpago-precio-info">
            <span className="mpago-precio-label">Premium mensual sin imp.</span>
            <span className="mpago-precio-desc">Sin anuncios · Playlists · Favoritos · Modo dorado</span>
          </div>
          <span className="mpago-precio-valor">$1.99<span>/mes</span></span>
        </div>

        {/* Tarjeta visual */}
        <div className={`mpago-card-visual ${brand ? "mpago-card-visual--" + brand.toLowerCase().replace(" ", "") : ""}`}>
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
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', width: '70%' }}>
              <button onClick={descargarPDF} className="mpago-btn-pagar" style={{ background: '#bfe630', color: 'black' }}>
                📄 Descargar Comprobante
              </button>
              <button onClick={finalizarFlujo} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', marginTop: '5px' }}>
                Entrar a la App →
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Comprobante oculto para generar PDF */}
      <div style={{ 
        position: 'absolute',
        left: '-9999px',
        top: '-9999px',
        width: '600px',
        height: 'auto',
        zIndex: -9999,
        opacity: 0,
        pointerEvents: 'none'
      }}>
        <div 
          ref={comprobanteRef} 
          style={{ 
            width: '600px', 
            padding: '40px', 
            background: '#ffffff', 
            color: '#000000', 
            fontFamily: 'Arial, sans-serif',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            borderRadius: '8px'
          }}
        >
          {/* Header del comprobante */}
          <div style={{ 
            borderBottom: '3px solid #4F46E5',
            paddingBottom: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ 
                  color: '#d6ed44', 
                  margin: '0 0 5px 0', 
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>
                  COMPROBANTE DE COMPRA
                </h2>
                
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  margin: '0',
                  fontWeight: '500'
                }}>
                  Suscripción Premium - Music App
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#666', 
                  margin: '0',
                  fontWeight: '500'
                }}>
                  Se cobra el mes proximo.
                </p>
              </div>
              <div style={{ 
                background: '#10B981',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                #PAGO-{Date.now().toString().slice(-6)}
              </div>
            </div>
          </div>

          {/* Datos del comprobante */}
          <div style={{ padding: '10px 0' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Cliente:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{nombreCliente}</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Método de Pago:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{brand || 'TARJETA'} (•••• {ultimosDigitos})</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Plan:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>Premium Mensual</span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Monto:</span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '20px', 
                color: '#10B981'
              }}>
                $1.99 USD
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0', 
              borderBottom: '1px solid #e5e7eb' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Estado:</span>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ fontSize: '18px' }}>✓</span> Aprobado (Simulación)
              </span>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px 0' 
            }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Fecha:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{fechaFormateada}</span>
            </div>
          </div>

          {/* Footer del comprobante */}
          <div style={{ 
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '2px solid #e5e7eb'
          }}>
            <div style={{ 
              background: '#F3F4F6', 
              padding: '15px', 
              borderRadius: '8px'
            }}>
              <p style={{ 
                textAlign: 'center', 
                fontSize: '13px', 
                color: '#4B5563',
                margin: '0',
                fontWeight: '500'
              }}>
                ¡Gracias por tu suscripción! Disfruta de todos los beneficios Premium.
              </p>
              <p style={{ 
                textAlign: 'center', 
                fontSize: '11px', 
                color: '#9CA3AF',
                margin: '8px 0 0 0'
              }}>
                * Este comprobante es una simulación para fines demostrativos
              </p>
            </div>
          </div>
        </div>
      </div>

    </div> 
  );
}

export default ModalPago;