import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import './App.css';
import LayoutCliente from "./componentes/ClienteLayout";
import LayoutAdmin from "./componentes/AdminLayout"; 
import Home from "./pages/Home";
import Search from "./pages/Search";
import Playlist from "./pages/Playlists"; 
import AlbumDetail from "./pages/AlbumDetails";
import Admin from "./pages/Admin";
import Login from "./pages/Login"; 
import Register from "./pages/Register";

function App() {
  const [trackActual, setTrackActual] = useState(null);

  // 🔐 Estado inicial: revisamos si el usuario ya tiene sesión activa en este navegador
  const [token, setToken] = useState(localStorage.getItem('token'));

  // 🚪 Función para cerrar sesión (la puedes pasar a los layouts si quieres un botón de Logout)
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // 🛡️ CONTROL DE ACCESO: Si NO hay token, forzamos a que solo vea el Login
  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Cualquier URL a la que intente entrar lo mandará al formulario de Login */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />  {/* ☝️ agregá esto */}

        </Routes>
      </BrowserRouter>
    );
  }

  // 🎉 SI HAY TOKEN: Se desbloquea toda tu app original de música
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Si el usuario ya está logueado e intenta ir a /login, lo rebotamos al Home */}
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* ================= ZONA CLIENTE ================= */}
        <Route element={<LayoutCliente trackActual={trackActual} setTrackActual={setTrackActual} cerrarSesion={cerrarSesion} />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlists" element={<Playlist setTrackActual={setTrackActual} />} />
          <Route path="/playlist" element={<Navigate to="/playlists" replace />} />
          <Route path="/album/:albumName/:artistName" element={<AlbumDetail setTrackActual={setTrackActual} />} />
        </Route>

        {/* ================= ZONA ADMIN ================= */}
        <Route element={<LayoutAdmin cerrarSesion={cerrarSesion} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* COMODÍN GENERAL: Si escribe cualquier ruta rota estando logueado, va al Home */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;