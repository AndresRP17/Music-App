import "./Sidebar.css"
import { Link } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaSearch } from "react-icons/fa";
import { IoIosHeartHalf } from "react-icons/io";
import { IoIosMusicalNotes } from "react-icons/io";


function Sidebar() {
  return (
    <div className="container">

      <aside className="sidebar">
        <h2>

          Music App
          <IoIosMusicalNotes />
</h2>
           <img
        src="/yuuta.jpg"
        alt="logo"
        className="logo"
        />

        <ul>
          
          <Link style={{ textDecoration: 'none' }} to="/">
          <li>
          <FaHome />
          Inicio</li>
          </Link>
        
       <Link style={{ textDecoration: 'none' }} to="/search">
  <li>
    <FaSearch />
    Buscar
  </li>
</Link>


          <Link style={{ textDecoration: 'none' }} to="/playlist">
          <li>
        <IoIosHeartHalf />
            Playlists
            </li>
        </Link>

        </ul>



       <p className="copy">
    © 2026 By Andres Fernandez
  </p>
      </aside>

    </div>


  )
}

export default Sidebar