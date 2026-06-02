// src/components/Sidebar.jsx
import "./Sidebar.css"
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";
import { IoIosHeartHalf, IoIosMusicalNotes } from "react-icons/io";
import { GrConfigure } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi";

const navItems = [
  { to: "/",              icon: <FaHome />,         label: "Inicio" },
  { to: "/search",        icon: <FaSearch />,       label: "Buscar" },
  { to: "/playlists",     icon: <IoIosHeartHalf />, label: "Favoritos" },
  { to: "/configuracion", icon: <GrConfigure />,    label: "Configuración" },
];

function Sidebar({ cerrarSesion }) {
  const location = useLocation();

  // 🛠️ Función auxiliar para definir el origen del logo según el entorno
  const obtenerRutaLogo = () => {
    // Si estamos en Netlify, forzamos la imagen local de fallback para la demo
    if (window.location.hostname.includes("netlify")) {
      return "/yuuta.jpg";
    }
    // Si estamos en localhost, sigue el flujo real con tu backend
    const logo = localStorage.getItem("logo");
    return logo ? `http://localhost:8086/${logo}` : "/yuuta.jpg";
  };

  const [logoSrc, setLogoSrc] = useState(() => obtenerRutaLogo());

  useEffect(() => {
    const handleLogoActualizado = () => {
      setLogoSrc(obtenerRutaLogo());
    };
    window.addEventListener("logoActualizado", handleLogoActualizado);
    return () => window.removeEventListener("logoActualizado", handleLogoActualizado);
  }, []);

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <h2><IoIosMusicalNotes /> Music App</h2>
      <img src={logoSrc} alt="logo" className="logo" />

      <ul>
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to} style={{ textDecoration: "none" }}>
            <li className={isActive(to) ? "active" : ""}>
              {icon}
              <span>{label}</span>
            </li>
          </Link>
        ))}

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