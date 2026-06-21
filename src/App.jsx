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
  const [listaActual, setListaActual] = useState([]);
  const [indexActual, setIndexActual] = useState(0);

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));

  const cerrarSesion = () => {
    localStorage.clear();
    setRole(null);
    setToken(null);
  };

  // Función central para reproducir — reemplaza todos los setTrackActual directos
  const reproducirLista = (canciones, index) => {
    setListaActual(canciones);
    setIndexActual(index);
    setTrackActual(canciones[index]);
  };

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
          />
        }>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search reproducirLista={reproducirLista} />} />
          <Route path="/mi-musica" element={<MiMusica reproducirLista={reproducirLista} />} />
          <Route path="/Favorites" element={<Navigate to="/mi-musica" replace />} />
          <Route path="/playlist/:id" element={<PlaylistDetalle reproducirLista={reproducirLista} />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/album/:albumName/:artistName" element={<AlbumDetail reproducirLista={reproducirLista} />} />
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
  );
}

export default App;