import "./Sidebar.css"
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";
import { IoIosHeartHalf, IoIosMusicalNotes, IoMdHelp } from "react-icons/io";
import { GrConfigure } from "react-icons/gr";
import { FiLogOut } from "react-icons/fi"; 

function Sidebar({ cerrarSesion }) {

  const [logoSrc, setLogoSrc] = useState(() => {
    const logo = localStorage.getItem("logo");
    return logo ? `http://localhost:8086/${logo}` : "/yuuta.jpg";
  });

  useEffect(() => {
    const handleLogoActualizado = () => {
      const logo = localStorage.getItem("logo");
      setLogoSrc(logo ? `http://localhost:8086/${logo}` : "/yuuta.jpg");
    };

    window.addEventListener("logoActualizado", handleLogoActualizado);
    return () => window.removeEventListener("logoActualizado", handleLogoActualizado);
  }, []);

  return (
    <aside className="sidebar">
      <h2> Music App<IoIosMusicalNotes /></h2>
      <img src={logoSrc} alt="logo" className="logo" />
      <ul>
        <Link style={{ textDecoration: 'none' }} to="/">
          <li><FaHome /> Inicio</li>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/search">
          <li><FaSearch /> Buscar</li>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/playlists">
          <li><IoIosHeartHalf /> Favoritos</li>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/configuracion">
          <li><GrConfigure /> Configuracion</li>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="">
          <li><IoMdHelp /> Ayuda</li>
        </Link>
      </ul>
      <button className="logout-btn" onClick={cerrarSesion}>
        <FiLogOut /> Cerrar Sesión
      </button>
      <p className="copy"> © 2026 By Andres Fernandez</p>
    </aside>
  )
}

export default Sidebar;