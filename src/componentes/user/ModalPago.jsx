import { useState, useRef } from "react";
import "./styles/ModalPago.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// -------- HELPERS DE FORMATO --------
const formatCardNumber = (val) =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const esProd = window.location.hostname.includes("netlify");


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

// -------- PLANES CON PERÍODOS (SOLO PREMIUM Y FAMILIAR) --------
const PERIODOS = [
  { id: 'mensual', label: 'Mensual', badge: null },
  { id: 'semestral', label: 'Semestral'},
  { id: 'anual', label: 'Anual'}
];

const PLANES = [
  {
    id: 'premium',
    nombre: 'Premium',
    descripcion: 'Experiencia completa sin anuncios',
    icono: '👑',
    color: '#d0b412',
    popular: true,
    precios: {
      mensual: { precio: 1.99, texto: '$1.99/mes', badge: null, ahorro: null },
      semestral: { precio: 9.99, texto: '$9.99/6 meses', badge: 'Ahorrá 16%', ahorro: 'vs $11.94' },
      anual: { precio: 17.99, texto: '$17.99/año', badge: '🔥 Mejor oferta', ahorro: 'vs $23.88' }
    },
    caracteristicas: [
      'Sin anuncios',
      'Playlists ilimitadas',
      'Favoritos',
      'Modo dorado'
    ]
  },
  {
    id: 'familiar',
    nombre: 'Familiar',
    descripcion: 'Plan familiar hasta 6 cuentas',
    icono: '👨‍👩‍👧‍👦',
    color: '#10B981',
    popular: false,
    precios: {
      mensual: { precio: 4.99, texto: '$4.99/mes', badge: null, ahorro: null },
      semestral: { precio: 24.99, texto: '$24.99/6 meses', badge: 'Ahorrá 17%', ahorro: 'vs $29.94' },
      anual: { precio: 44.99, texto: '$44.99/año', badge: '🔥 Mejor oferta', ahorro: 'vs $59.88' }
    },
    caracteristicas: [
      'Todo lo de Premium',
      'Hasta 6 cuentas',
      'Control parental',
      'Modo familiar'
    ]
  }
];

function ModalPago({ onCerrar, onPagoExitoso, userId }) {
  // -------- ESTADOS --------
  const [step, setStep] = useState("plan");
  const [planSeleccionado, setPlanSeleccionado] = useState(null);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('mensual');
  const [form, setForm] = useState({ numero: "", nombre: "", expiry: "", cvv: "" });
  const [errores, setErrores] = useState({});
  const [fechaPago, setFechaPago] = useState(null);
  const [suscripcionId, setSuscripcionId] = useState(null);

  const comprobanteRef = useRef();
  const brand = detectBrand(form.numero);

  // El plan que se muestra en los tabs (siempre el seleccionado o Premium por defecto)
  const plan = planSeleccionado || PLANES[0];
  const periodo = PERIODOS.find(p => p.id === periodoSeleccionado) || PERIODOS[0];

  // ESTO ES LO IMPORTANTE: el plan elegido para el resumen y el pago 
  const planElegido = planSeleccionado || PLANES[0];
  const precioElegido = planElegido.precios[periodoSeleccionado];

  // -------- FUNCIONES --------
  const descargarPDF = async () => {
    const elemento = comprobanteRef.current;
    if (!elemento) return;

    try {
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
      pdf.save(`comprobante-${plan.id}-${periodoSeleccionado}-${Date.now()}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
      alert("Error al generar el comprobante");
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
    const mesNum = parseInt(mm);
    const anioNum = parseInt("20" + yy);
    const ahora = new Date();
    const anioActual = ahora.getFullYear();
    const mesActual = ahora.getMonth() + 1;

    if (!mm || !yy || isNaN(mesNum) || isNaN(anioNum) ||
        mesNum < 1 || mesNum > 12 ||
        anioNum < anioActual ||
        (anioNum === anioActual && mesNum < mesActual)) {
      nuevos.expiry = "Tarjeta vencida o fecha inválida";
    }

    if (form.cvv.length < 3) nuevos.cvv = "CVV inválido";

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  };

  // ⭐⭐⭐ SELECCIONAR PLAN CON LOGS ⭐⭐⭐
  const seleccionarPlan = (plan, periodo) => {
    console.log('✅ Plan seleccionado:', plan.nombre);
    console.log('✅ Período:', periodo);
    console.log('✅ Precio:', plan.precios[periodo].precio);
    
    setPlanSeleccionado(plan);
    setPeriodoSeleccionado(periodo);
    const precio = plan.precios[periodo].precio;
    if (precio === 0) {
      setStep("exito");
      setFechaPago(new Date());
    } else {
      setStep("form");
    }
  };

  const cambiarPeriodo = (periodo) => {
    console.log('🔄 Cambiando período a:', periodo);
    setPeriodoSeleccionado(periodo);
  };

  // 🔧 FIX: agregar arriba del todo del archivo, junto a los demás imports/helpers:
const esProd = window.location.hostname.includes("netlify");

// 🔧 FIX: reemplazar el handleSubmit actual por este,
// que simula el pago con localStorage cuando esProd es true
// (en vez de pegarle a un backend que no existe en Netlify).
const handleSubmit = async () => {
  if (!validar()) return;

  const planActual = planSeleccionado || PLANES[0];
  const precioActual = planActual.precios[periodoSeleccionado];

  const payload = {
    id_user: userId || null,
    monto: precioActual.precio,
    fecha: new Date().toISOString(),
    estado: 'exitoso', // 👈 mismo valor que usa Admin.jsx para filtrar pagos confirmados
    ultimos: form.numero.replace(/\s/g, "").slice(-4) || "0000",
    marca: brand || "TARJETA",
    plan: planActual.id,
    periodo: periodoSeleccionado,
  };

  setStep("procesando");
  setFechaPago(new Date());

  // -------- RAMA NETLIFY (sin backend real) --------
  if (esProd) {
    // Simulamos una pequeña demora, como si fuera una llamada real
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const pagoSimulado = {
      id: Date.now(),
      ...payload,
    };

    const pagosGuardados = JSON.parse(localStorage.getItem("pagos") || "[]");
    localStorage.setItem("pagos", JSON.stringify([...pagosGuardados, pagoSimulado]));

    setSuscripcionId(pagoSimulado.id);
    setStep("exito");
    return;
  }

  // -------- RAMA BACKEND REAL --------
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No estás autenticado. Iniciá sesión primero.');
    }

    const response = await fetch('/api/pagos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al procesar el pago');
    }

    const data = await response.json();

    setSuscripcionId(data.id_suscripcion || data.id || 'PENDIENTE');
    setStep("exito");

  } catch (error) {
    console.error('❌ Error:', error);
    alert('❌ Error: ' + error.message);
    setStep("plan");
  }
};
  const finalizarFlujo = () => {
    const ultimos = form.numero.replace(/\s/g, "").slice(-4) || "0000";
    // ⭐ LOG PARA VER QUÉ SE ESTÁ ENVIANDO ⭐
    console.log('📤 Enviando a onPagoExitoso:', {
      ultimos,
      brand: brand || "OTRO",
      planSeleccionado,
      periodoSeleccionado
    });
    onPagoExitoso(ultimos, brand || "OTRO", planSeleccionado, periodoSeleccionado);
    onCerrar();
    // ⭐ Sacamos el reload de acá: si recargás ahora, React ni llega a pintar
    // el ModalPremiumBienvenida que onPagoExitoso recién pidió mostrar.
    // El refresh real ahora pasa en Configuracion.jsx, cuando el usuario
    // cierra el modal de bienvenida (ver onClose de ModalPremiumBienvenida).
  };

  // -------- DATOS PARA COMPROBANTE --------
  const ultimosDigitos = form.numero.replace(/\s/g, "").slice(-4) || "0000";
  const nombreCliente = form.nombre.toUpperCase() || "SUSCRITO";
  const fechaFormateada = fechaPago ? fechaPago.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) : new Date().toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  // -------- RENDER SELECTOR DE PERÍODO (tabs) --------
  const renderPeriodoTabs = () => (
    <div className="mpago-periodos-wrapper">
      <div className="mpago-periodos">
        {PERIODOS.map((p) => {
          const isActive = periodoSeleccionado === p.id;
          const precio = plan.precios[p.id];
          return (
            <button
              key={p.id}
              className={`mpago-periodo-btn ${isActive ? 'mpago-periodo-btn--active' : ''}`}
              onClick={() => cambiarPeriodo(p.id)}
            >
              <span className="mpago-periodo-label">{p.label}</span>
              {p.badge && (
                <span className="mpago-periodo-badge">
                  {p.badge}
                </span>
              )}
              {precio.precio > 0 && (
                <span className="mpago-periodo-precio">
                  {precio.texto}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  // -------- RENDER CARDS DE PLANES (SOLO 2) --------
  const renderSeleccionPlanes = () => (
    <div className="mpago-planes">
      {/* HEADER con la cruz arriba a la derecha */}
      <div className="mpago-header">
        <div className="mpago-header-left">
          <p className="mpago-eyebrow">🎵 Elegí tu plan</p>
          <h2 className="mpago-title">Suscribite a Music App</h2>
          <p className="mpago-subtitle">Seleccioná el plan que mejor se adapte a vos</p>
        </div>
        <button className="mpago-cerrar" onClick={onCerrar}>×</button>
      </div>

      {/* TABS DE PERÍODOS */}
      {renderPeriodoTabs()}

      <div className="mpago-planes-grid">
        {PLANES.map((p) => {
          const isSelected = planSeleccionado?.id === p.id;
          const precio = p.precios[periodoSeleccionado];
          const isFree = precio.precio === 0;

          return (
            <div
              key={p.id}
              className={`mpago-plan-card ${p.popular ? 'mpago-plan-card--popular' : ''} ${isSelected ? 'mpago-plan-card--selected' : ''}`}
              onClick={() => seleccionarPlan(p, periodoSeleccionado)}
            >
              {p.popular && (
                <div className="mpago-plan-badge">
                  ⭐ POPULAR
                </div>
              )}

              <div className="mpago-plan-header">
                <div className="mpago-plan-icon" style={{ color: p.color }}>
                  {p.icono}
                </div>
                <h3 className="mpago-plan-nombre">{p.nombre}</h3>
                <p className="mpago-plan-desc">{p.descripcion}</p>
              </div>

              <div className="mpago-plan-precio-container">
                {isFree ? (
                  <div className="mpago-plan-precio-free">
                    Gratis
                    <span className="mpago-plan-precio-free-sub">para siempre</span>
                  </div>
                ) : (
                  <>
                    <span className="mpago-plan-precio-number" style={{ color: p.color }}>
                      {precio.texto}
                    </span>
                    {precio.ahorro && (
                      <span className="mpago-plan-precio-ahorro">
                        {precio.ahorro}
                      </span>
                    )}
                    {precio.badge && (
                      <span className="mpago-plan-precio-badge" style={{ backgroundColor: p.color }}>
                        {precio.badge}
                      </span>
                    )}
                  </>
                )}
              </div>

              <ul className="mpago-plan-caracteristicas">
                {p.caracteristicas.map((c, idx) => (
                  <li key={idx}>
                    <span className="mpago-check-icon">✓</span>
                    {c}
                  </li>
                ))}
              </ul>

              <button
                className={`mpago-plan-btn ${isSelected ? 'mpago-plan-btn--selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  seleccionarPlan(p, periodoSeleccionado);
                }}
              >
                {isSelected ? '✓ Seleccionado' : (isFree ? 'Comenzar Gratis' : 'Seleccionar')}
              </button>
            </div>
          );
        })}
      </div>

      <p className="mpago-disclaimer">
        🔒 Podés cancelar cuando quieras · Todos los precios son en USD
      </p>
    </div>
  );

  // -------- RENDER FORMULARIO DE PAGO --------
  const renderFormularioPago = () => (
    <>
      <div className="mpago-header">
        <div className="mpago-header-left">
          <p className="mpago-eyebrow">
            {planElegido.nombre} · {periodo.label}
          </p>
          <h2 className="mpago-title">Completá tu pago</h2>
        </div>
        <button
          className="mpago-cerrar"
          onClick={() => setStep("plan")}
        >
          ←
        </button>
      </div>

      <div className="mpago-resumen-plan">
        <div className="mpago-resumen-icon" style={{ color: planElegido.color }}>
          {planElegido.icono}
        </div>
        <div className="mpago-resumen-info">
          <span className="mpago-resumen-nombre">{planElegido.nombre}</span>
          <span className="mpago-resumen-periodo">{periodo.label}</span>
        </div>
        <span className="mpago-resumen-precio" style={{ color: planElegido.color }}>
          {precioElegido.texto}
        </span>
      </div>

      <div className={`mpago-card-visual ${brand ? "mpago-card-visual--" + brand.toLowerCase().replace(" ", "") : ""}`}>
        <div className="mpago-card-chip"><div className="mpago-chip-inner" /></div>
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
          Pagar {precioElegido.texto}
        </button>

        <p className="mpago-disclaimer">🔒 Pago simulado — no se realizan cargos reales</p>
      </div>
    </>
  );

  // -------- RENDER ESTADO --------
  const renderEstado = () => (
    <div className="mpago-estado">
      {step === "procesando" ? (
        <>
          <div className="mpago-spinner" />
          <p>Procesando pago...</p>
          <span>Aguarde por favor</span>
        </>
      ) : (
        <>
          <div className="mpago-check">✓</div>
          <p style={{ color:  '#d0b412'  }}>¡Pago exitoso!</p>
          <span style={{ color: '#d0b412' }}>Se ha activado tu cuenta {planElegido.nombre} ({periodo.label})</span>

          <div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '10px', 
  marginTop: '20px', 
  width: '70%', 
  alignItems: 'center'
}}>
  <button 
  className="btn-finalizar"
  onClick={finalizarFlujo} 
>
  Entrar a MusicApp
</button>
  
  <button 
    onClick={descargarPDF} 
    className="comprobante" 
  >
    Descargar Comprobante
  </button>
</div>
        </>
      )}
    </div>
  );

  // -------- RENDER MODAL --------
  return (
    <div className="mpago-overlay" onClick={step === "exito" ? finalizarFlujo : onCerrar}>
      <div className="mpago-modal" onClick={(e) => e.stopPropagation()}>

        {step === "plan" && renderSeleccionPlanes()}
        {step === "form" && renderFormularioPago()}
        {(step === "procesando" || step === "exito") && renderEstado()}

      </div>

      {/* COMPROBANTE PDF (oculto) */}
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
        <div ref={comprobanteRef} style={{
          width: '600px',
          padding: '40px',
          background: '#ffffff',
          color: '#000000',
          fontFamily: 'Arial, sans-serif',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          borderRadius: '8px'
        }}>
          <div style={{
            borderBottom: `3px solid ${planElegido.color || '#d0b412'}`,
            paddingBottom: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ color: planElegido.color, margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>
                  {planElegido.icono} COMPROBANTE
                </h2>
                <p style={{ fontSize: '14px', color: '#666', margin: '0', fontWeight: '500' }}>
                  Plan {planElegido.nombre} - {periodo.label} - Music App
                </p>
              </div>
              <div style={{ background: '#10B981', color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>
                #PAGO-{Date.now().toString().slice(-6)}
              </div>
            </div>
          </div>

          <div style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Cliente:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{nombreCliente}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Método de Pago:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{brand || 'TARJETA'} (•••• {ultimosDigitos})</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Plan:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{planElegido.nombre}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Período:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{periodo.label}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Monto:</span>
              <span style={{ fontWeight: 'bold', fontSize: '20px', color: precioElegido.precio === 0 ? '#6B7280' : '#10B981' }}>
                {precioElegido.precio === 0 ? 'GRATIS' : `${precioElegido.texto}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
              <span style={{ fontWeight: 'bold', color: '#4B5563' }}>Fecha:</span>
              <span style={{ fontWeight: '500', color: '#1F2937' }}>{fechaFormateada}</span>
            </div>
          </div>

          <div style={{ marginTop: '25px', paddingTop: '20px', borderTop: '2px solid #e5e7eb' }}>
            <div style={{ background: '#F3F4F6', padding: '15px', borderRadius: '8px' }}>
              <p style={{ textAlign: 'center', fontSize: '13px', color: '#4B5563', margin: '0', fontWeight: '500' }}>
                ¡Gracias por tu suscripción! Disfruta de todos los beneficios del plan {planElegido.nombre}.
              </p>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#9CA3AF', margin: '8px 0 0 0' }}>
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