import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
import { ToastProvider } from "./pages/ToastContext";
import './App.css';

function App() {
  const [trackActual, setTrackActual] = useState(null);
  const [listaActual, setListaActual] = useState([]);
  const [indexActual, setIndexActual] = useState(0);
  const pausarRef = useRef(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const cerrarSesion = () => {
    localStorage.clear();
    setRole(null);
    setToken(null);
  };

  const pausar = () => {
    pausarRef.current?.();
  };

  const reproducirLista = (canciones, index) => {
    setListaActual(canciones);
    setIndexActual(index);
    setTrackActual(canciones[index]);
  };

  useEffect(() => {
    const sincronizarRol = () => {
      setRole(localStorage.getItem('role'));
    };

    // Escuchamos el evento que creamos en la configuración
    window.addEventListener("rolActualizado", sincronizarRol);

    return () => {
      window.removeEventListener("rolActualizado", sincronizarRol);
    };
  }, []);

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route element={
            <LayoutCliente
              trackActual={trackActual}
              setTrackActual={setTrackActual}
              listaActual={listaActual}
              indexActual={indexActual}
              reproducirLista={reproducirLista}
              cerrarSesion={cerrarSesion}
              onPausarRef={pausarRef}
            />
          }>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search reproducirLista={reproducirLista} pausar={pausar} />} />
            <Route path="/mi-musica" element={<MiMusica reproducirLista={reproducirLista} pausar={pausar} />} />
            <Route path="/Favorites" element={<Navigate to="/mi-musica" replace />} />
            <Route path="/playlist/:id" element={<PlaylistDetalle reproducirLista={reproducirLista} pausar={pausar} />} />
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/album/:albumName/:artistName" element={<AlbumDetail reproducirLista={reproducirLista} pausar={pausar} />} />
            <Route path="/artist/:artistName" element={<ArtistDetail reproducirLista={reproducirLista} />} />
          </Route>

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
    </ToastProvider>
  );
}

export default App;