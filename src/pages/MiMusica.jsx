import { useState } from 'react';
import Playlist from './Playlists';        // tus favoritos actuales
import MisPlaylists from './MisPlaylists'; // nuevo componente (lo creamos después)
import './MiMusica.css';

const MiMusica = ({ setTrackActual }) => {
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
          ? <Playlist setTrackActual={setTrackActual} />
          : <MisPlaylists setTrackActual={setTrackActual} />
        }
      </div>
    </div>
  );
};

export default MiMusica;