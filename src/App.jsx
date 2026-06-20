import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import LayoutCliente from "./componentes/ClienteLayout";
import LayoutAdmin from "./componentes/AdminLayout"; 
import Home from "./pages/Home";
import Search from "./pages/Search";
import Favorites from "./pages/Favorites"; 
import AlbumDetail from "./pages/AlbumDetails";
import Admin from "./pages/Admin";
import Login from "./pages/Login"; 
import Register from "./pages/Register";
import ListaUsuarios from "./componentes/ListaUsuarios";
import DetalleUsuario from "./componentes/DetalleUsuario";
import Configuracion from './pages/Configuration';
import MiMusica from "./pages/MiMusica";
import PlaylistDetalle from "./pages/PlaylistDetalle"; 
import ArtistDetail from "./pages/ArtistDetail";
import './App.css';

function App() {
  const [trackActual, setTrackActual] = useState(null);

  // Estado inicial: revisamos si el usuario ya tiene sesión activa en este navegador
  const [token, setToken] = useState(localStorage.getItem('token'));
const [role, setRole] = useState(localStorage.getItem('role'));

  // Función para cerrar sesión (la puedes pasar a los layouts si quieres un botón de Logout)
  const cerrarSesion = () => {
    localStorage.clear();
    setRole(null);
    setToken(null);
  };

  // CONTROL DE ACCESO: Si NO hay token, forzamos a que solo vea el Login
  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          {/* Cualquier URL a la que intente entrar lo mandará al formulario de Login */}
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
          <Route path="/register" element={<Register />} />  

        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        
        <Route path="/login" element={<Navigate to="/" replace />} />
        
        {/* ================= ZONA CLIENTE ================= */}
        <Route element={<LayoutCliente trackActual={trackActual} setTrackActual={setTrackActual} cerrarSesion={cerrarSesion} />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search setTrackActual={setTrackActual} />} />
          <Route path="/mi-musica" element={<MiMusica setTrackActual={setTrackActual} />} />
          <Route path="/Favorites" element={<Navigate to="/mi-musica" replace />} />
          <Route path="/playlist/:id" element={<PlaylistDetalle setTrackActual={setTrackActual} />} /> {/* 👈 agregado */}
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/album/:albumName/:artistName" element={<AlbumDetail setTrackActual={setTrackActual} />} />
          <Route path="/artist/:artistName" element={<ArtistDetail setTrackActual={setTrackActual} />} />
        </Route>

      {/* ================= ZONA ADMIN ================= */}
        <Route element={
          role === 'admin'
            ? <LayoutAdmin cerrarSesion={cerrarSesion} />
            : <Navigate to="/" replace />
        }>
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/usuarios" element={<ListaUsuarios />} />
          <Route path="/admin/usuarios/:id" element={<DetalleUsuario />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;