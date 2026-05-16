// src/componentes/LayoutAdmin.jsx
import { Outlet } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";

function LayoutAdmin() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#121212", overflow: "hidden" }}>
      {/* El menú exclusivo del Administrador */}
      <SidebarAdmin />

      {/* Contenedor de las páginas del Admin (ej: tu panel de estadísticas) */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", color: "white" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutAdmin;