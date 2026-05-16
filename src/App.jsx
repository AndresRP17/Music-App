import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import './App.css'
import LayoutCliente from "./componentes/ClienteLayout";
import LayoutAdmin from "./componentes/AdminLayout"; // 🆕 Importamos el Layout de Admin
import Home from "./pages/Home";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import AlbumDetail from "./pages/AlbumDetails";
import Admin from "./pages/Admin";

function App() {
  const [trackActual, setTrackActual] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        
        {/* ================= ZONA CLIENTE ================= */}
        <Route element={<LayoutCliente trackActual={trackActual} setTrackActual={setTrackActual} />}>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/playlist" element={<Playlists />} />
          <Route path="/album/:albumName/:artistName" element={<AlbumDetail setTrackActual={setTrackActual} />} />
        </Route>

        {/* ================= ZONA ADMIN ================= */}
        {/* 🆕 Ahora las rutas de admin también tienen su propio diseño estructural */}
        <Route element={<LayoutAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;