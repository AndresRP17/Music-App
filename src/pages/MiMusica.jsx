import { useState } from 'react';
import Favorites from './Favorites';
import MisPlaylists from './MisPlaylists';
import './MiMusica.css';

const MiMusica = ({ reproducirLista, pausar }) => {
  const [pestanaActiva, setPestanaActiva] = useState('favoritos');

  return (
    <div className="mi-musica-container">
      <div className="mi-musica-tabs">
        <button
          className={`mi-musica-tab ${pestanaActiva === 'favoritos' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('favoritos')}
        >
          ❤️ Favoritos
        </button>
        <button
          className={`mi-musica-tab ${pestanaActiva === 'playlists' ? 'active' : ''}`}
          onClick={() => setPestanaActiva('playlists')}
        >
          🎵 Playlists
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