// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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

 return (
 <aside 
  className="sidebar" 
  style={{ 
    // 🌟 Todo resuelto con la misma condición y con las comas en su lugar
    border: (role === "premium" || role === "admin") ? '2px solid #d0b412' : 'none', 
    boxShadow: (role === "premium" || role === "admin") ? '0 4px 12px rgba(208, 180, 18, 0.15)' : 'none' 
  }}
>
  
   <h2 style={{ color: role === "premium" || role === "admin" ? "#d0b412" : "" }}>
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
    />  {/* 🌟 Antes de tu return, asegurate de tener esta variable definida:
const esPremium = role === "premium" || role === "admin"; 
*/}

<ul>
  {navItems.map(({ to, icon, label }) => (
    <Link key={to} to={to} style={{ textDecoration: "none" }}>
      {/* 🌟 CLAVAMOS LA CONDICIÓN DIRECTA ACÁ ADENTRO */}
      <li className={isActive(to) ? `active ${(role === "premium" || role === "admin") ? 'premium' : ''}` : ""}>
        {icon}
        <span>{label}</span>
      </li>
    </Link>
  ))}

  {/* BOTÓN CONDICIONAL EXCLUSIVO PARA EL ADMIN */}
  {role === "admin" && (
    <Link to="/admin" style={{ textDecoration: "none" }} className="hide-on-mobile">
      {/* Al ser Admin, ya sabemos que entra en la bolsa de premium para el CSS, así que se la dejamos fija si está activo */}
      <li className={isActive("/admin") ? "active premium" : ""}>
        <FaChartBar />
        <span>Estadísticas</span>
      </li>
    </Link>
  )}

  <li className="nav-logout" onClick={cerrarSesion}>
    <FiLogOut />
    <span>Salir</span>
  </li>

</ul>

      <p className="copy">© 2026 By Andres Fernandez</p>
    </aside>
  );
}

export default Sidebar;