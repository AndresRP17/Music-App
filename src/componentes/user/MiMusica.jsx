import { useState } from 'react';
import Favorites from './Favorites';
import MisPlaylists from './MisPlaylists';
import './styles/MiMusica.css';

const MiMusica = ({ reproducirLista, pausar }) => {
  const [pestanaActiva, setPestanaActiva] = useState('favoritos');
  const role = localStorage.getItem("role") || "user";
  const esPremium = role === "premium" || role === "admin";


  const obtenerEstiloTab = (nombreTab) => {
    const estaActiva = pestanaActiva === nombreTab;
    
    if (estaActiva) {
      return {
        color: esPremium ? '#d0b412' : '#fff',
        borderBottom: esPremium ? '2px solid #FFD700' : '2px solid #1db954',
        fontWeight: '600'
      };
    }
    
   
    return {
      color: '#aaa',
      borderBottom: '2px solid transparent'
    };
  };

  return (
    <div className="mi-musica-container">
      <div className="mi-musica-tabs">
        <button
          className={`mi-musica-tab ${pestanaActiva === 'favoritos' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('favoritos')}
          /* 🌟 LE CLAVAMOS EL ESTILO INLINE DIRECTO QUE MANDA SOBRE TODO EL CSS */
          style={obtenerEstiloTab('favoritos')}
        >
          Favoritos
        </button>
        <button
          className={`mi-musica-tab ${pestanaActiva === 'playlists' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('playlists')}
          /* 🌟 ACÁ TAMBIÉN */
          style={obtenerEstiloTab('playlists')}
        >
           Playlists
        </button>
      </div>

      <div className="mi-musica-contenido">
        {pestanaActiva === 'favoritos'
          ? <Favorites reproducirLista={reproducirLista} pausar={pausar} />
          : <MisPlaylists reproducirLista={reproducirLista} />
        }
      </div>
    </div>
  );
};

export default MiMusica;