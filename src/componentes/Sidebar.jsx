import "./Sidebar.css"
import { Link } from "react-router-dom";
import { FaHome, FaSearch } from "react-icons/fa";
import { IoIosHeartHalf, IoIosMusicalNotes, IoMdHelp } from "react-icons/io";
import { GrConfigure } from "react-icons/gr"; // Ya corregido ;)
import { FiLogOut } from "react-icons/fi"; 

// 🚀 PASO 1: Recibimos 'cerrarSesion' que es lo que realmente te manda el Layout
function Sidebar({ cerrarSesion }) {

  return (
    <aside className="sidebar">
      <h2> Music App<IoIosMusicalNotes /></h2>
      <img src="/yuuta.jpg" alt="logo" className="logo" />

      <ul>
        <Link style={{ textDecoration: 'none' }} to="/">
          <li><FaHome /> Inicio</li>
        </Link>
      
        <Link style={{ textDecoration: 'none' }} to="/search">
          <li><FaSearch /> Buscar</li>
        </Link>

        {/* Te lo corregí a /playlists con 's' porque así está tu ruta en App.jsx */}
        <Link style={{ textDecoration: 'none' }} to="/playlists">
          <li><IoIosHeartHalf /> Playlists</li>
        </Link>

        <Link style={{ textDecoration: 'none' }} to="">
          <li><GrConfigure /> Configuracion</li>
        </Link>

        <Link style={{ textDecoration: 'none' }} to="">
          <li><IoMdHelp /> Ayuda</li>
        </Link>
      </ul>

      {/* 🚀 PASO 2: Ejecutamos directo la función que viene desde App.jsx */}
      <button className="logout-btn" onClick={cerrarSesion}>
        <FiLogOut /> Cerrar Sesión
      </button>

      <p className="copy"> © 2026 By Andres Fernandez</p>
    </aside>
  )
}

export default Sidebar;