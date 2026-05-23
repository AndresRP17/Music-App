import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // 💡 Agregamos Navigate por comodidad
import { useState } from "react";

import './App.css'
import LayoutCliente from "./componentes/ClienteLayout";
import LayoutAdmin from "./componentes/AdminLayout"; 
import Home from "./pages/Home";
import Search from "./pages/Search";
import Playlist from "./pages/Playlists"; // 👈 Asegúrate de que tu archivo Playlists.jsx tenga abajo "export default Playlist;"
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
          
          {/* Tu ruta original en plural */}
          <Route path="/playlists" element={<Playlist setTrackActual={setTrackActual} />} />
          
          {/* 💡 COMODÍN: Si escribes /playlist en singular, te lleva automáticamente a /playlists sin romper la app */}
          <Route path="/playlist" element={<Navigate to="/playlists" replace />} />
          
          <Route path="/album/:albumName/:artistName" element={<AlbumDetail setTrackActual={setTrackActual} />} />
        </Route>

        {/* ================= ZONA ADMIN ================= */}
        <Route element={<LayoutAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

      </Routes>
    </BrowserRouter>
  )
}

export default App;