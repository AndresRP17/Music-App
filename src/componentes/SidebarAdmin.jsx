// src/componentes/SidebarAdmin.jsx
import { Link } from "react-router-dom";

function SidebarAdmin() {
  return (
    <div className="sidebar-admin" style={{ width: "240px", background: "#0c0c0c", height: "100vh", padding: "20px", color: "white" }}>
      <h2 style={{ color: "#e9efeb", marginBottom: "30px" }}> MusicAdmin🎵</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li style={{ margin: "20px 0" }}>
          <Link to="/admin" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>📊 Estadísticas Deezer</Link>
        </li>
        <li style={{ margin: "20px 0" }}>
        </li>
        <li style={{ margin: "40px 0 0 0" }}>
          <Link to="/" style={{ color: "#aaa", textDecoration: "none", fontSize: "14px" }}>← Salir al Cliente</Link>
        </li>
      </ul>
    </div>
  );
}

export default SidebarAdmin;