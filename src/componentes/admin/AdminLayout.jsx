// src/componentes/LayoutAdmin.jsx
import { Outlet } from "react-router-dom";
import SidebarAdmin from "./SidebarAdmin";

function LayoutAdmin() {
  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh", background: "#121212", overflow: "hidden" }}>
      <SidebarAdmin />
      <div style={{ flex: 1, padding: "40px", overflowY: "auto", color: "white" }}>
        {/* Aquí se cargarán ListaUsuarios, Estadísticas, etc. */}
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutAdmin;