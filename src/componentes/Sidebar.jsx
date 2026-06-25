// src/components/Sidebar.jsx
import "./Sidebar.css"
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
// Sumamos FaChartBar para el ícono de estadísticas
import { FaHome, FaSearch, FaChartBar } from "react-icons/fa"; 
import { IoIosMusicalNotes } from 'react-icons/io';
import { GrConfigure } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";

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
    <aside className="sidebar">
      <h2>MusicApp<IoIosMusicalNotes /></h2>
      <img src={logoSrc} alt="logo" className="logo" />

      <ul>
        {/* Ítems comunes de navegación */}
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <li className={isActive(to) ? "active" : ""}>
              {icon}
              <span>{label}</span>
            </li>
          </Link>
        ))}

        {/* 🛠️ BOTÓN CONDICIONAL EXCLUSIVO PARA EL ADMIN */}
        {role === "admin" && (
          <Link to="/admin" style={{ textDecoration: "none" }} className="hide-on-mobile">
            <li className={isActive("/admin") ? "active" : ""}>
              <FaChartBar />
              <span>Estadísticas</span>
            </li>
          </Link>
        )}

        {/* Cerrar sesión como último ítem del nav */}
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