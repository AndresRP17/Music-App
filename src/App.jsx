import { BrowserRouter, Routes, Route } from "react-router-dom";

import './App.css'
import Sidebar from './componentes/Sidebar'
import Home from "./pages/Home";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import AlbumDetail from "./pages/AlbumDetails";

function App() {

  return (

    <BrowserRouter>

      <div className="container">

        <Sidebar />

        <Routes>

          <Route path="/" element={<Home />} />

          <Route path="/search" element={<Search />} />

          <Route path="/album/:albumName/:artistName" element={<AlbumDetail />} />

          <Route path="/playlist" element={<Playlists />} />

        </Routes>

      </div>

    </BrowserRouter>

  )
}

export default App