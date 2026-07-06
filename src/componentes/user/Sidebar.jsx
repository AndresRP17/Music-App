// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ModalConfirmarLogout from "./ModalConfirmarLogout";
import { FaHome, FaSearch, FaChartBar, FaShieldAlt } from "react-icons/fa"; 
import { IoIosMusicalNotes } from 'react-icons/io';
import { GrConfigure } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";
import "./styles/Sidebar.css"

const navItems = [
  { to: "/",               icon: <FaHome />,         label: "Inicio" },
  { to: "/search",        icon: <FaSearch />,       label: "Buscar" },
  { to: "/mi-musica",     icon: <IoIosMusicalNotes />,      label: "Música" },
  { to: "/configuracion", icon: <GrConfigure />,    label: "Configuración" },
];

function Sidebar({ cerrarSesion }) {
  const location = useLocation();

  const obtenerRutaLogo = () => {
    if (window.location.hostname.includes("netlify")) return "/yuuta.jpg";
    const userId = localStorage.getItem("id");
    const logo = localStorage.getItem(`logo_${userId}`);
    return logo && logo !== '' ? `http://localhost:8086/${logo}` : "/yuuta.jpg";
  };

  const [logoSrc, setLogoSrc] = useState(() => obtenerRutaLogo());

  // 1. CREAMOS EL ESTADO PARA EL ROL
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  // 🔧 NUEVO: estado para mostrar/ocultar el modal de confirmación de logout
  const [confirmarLogout, setConfirmarLogout] = useState(false);

  useEffect(() => {
    const handleLogoActualizado = () => {
      setLogoSrc(obtenerRutaLogo());
    };

    // 2. ESCUCHADOR PARA CUANDO CAMBIE EL ROL
    const handleRolActualizado = () => {
      setRole(localStorage.getItem("role") || "user");
    };

    window.addEventListener("logoActualizado", handleLogoActualizado);
    window.addEventListener("rolActualizado", handleRolActualizado); // Escucha el cambio de rol

    return () => {
      window.removeEventListener("logoActualizado", handleLogoActualizado);
      window.removeEventListener("rolActualizado", handleRolActualizado);
    };
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    if (path === "/mi-musica") return location.pathname.startsWith("/mi-musica") || location.pathname.startsWith("/playlist");
    return location.pathname.startsWith(path);
  };

  const esPremiumOAdmin = role === "premium" || role === "admin";

 return (
 <aside 
  className="sidebar" 
  style={{ 
    border: esPremiumOAdmin ? '2px solid #d0b412' : 'none', 
    boxShadow: esPremiumOAdmin ? '0 4px 12px rgba(208, 180, 18, 0.15)' : 'none' 
  }}
>
  
   <h2 style={{ color: esPremiumOAdmin ? "#d0b412" : "" }}>
  MusicApp{" "}
  {role === "admin" ? (
    <FaShieldAlt />
  ) : role === "premium" ? (
    <span>👑</span>
  ) : (
    <IoIosMusicalNotes />
  )}
</h2>

    <img 
      src={logoSrc} 
      alt="logo" 
      className="logo" 
    />

<ul>
  {navItems.map(({ to, icon, label }) => (
    <Link key={to} to={to} style={{ textDecoration: "none" }}>
      <li className={isActive(to) ? `active ${esPremiumOAdmin ? 'premium' : ''}` : ""}>
        {icon}
        <span>{label}</span>
      </li>
    </Link>
  ))}

  {/* BOTÓN CONDICIONAL EXCLUSIVO PARA EL ADMIN */}
  {role === "admin" && (
    <Link to="/admin" style={{ textDecoration: "none" }} className="hide-on-mobile">
      <li className={isActive("/admin") ? "active premium" : ""}>
        <FaChartBar />
        <span>Estadísticas</span>
      </li>
    </Link>
  )}

  {/* 🔧 CAMBIO: ya no llama a cerrarSesion directo, ahora abre el modal */}
  <li className="nav-logout" onClick={() => setConfirmarLogout(true)}>
    <FiLogOut />
    <span>Salir</span>
  </li>

</ul>

      <p className="copy">© 2026 By Andres Fernandez</p>

      {confirmarLogout && (
        <ModalConfirmarLogout
          onConfirmar={cerrarSesion}
          onCancelar={() => setConfirmarLogout(false)}
        />
      )}
    </aside>
  );
}

export default Sidebar;