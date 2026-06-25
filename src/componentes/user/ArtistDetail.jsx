import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import './styles/Artist.css';

const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

const ArtistDetail = () => {
  const { artistName } = useParams();
  const navigate = useNavigate();
  const [artistInfo, setArtistInfo] = useState(null);
  const [albumes, setAlbumes] = useState([]);
  const [imagen, setImagen] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        // Info del artista desde Last.fm
        const resInfo = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json&autocorrect=1`
        );
        const dataInfo = await resInfo.json();
        if (dataInfo.artist) setArtistInfo(dataInfo.artist);

        // Foto del artista desde Deezer
        const resFoto = await fetch(`/deezer/search/artist?q=${encodeURIComponent(artistName)}`);
        const dataFoto = await resFoto.json();
        if (dataFoto.data && dataFoto.data.length > 0) {
          setImagen(dataFoto.data[0].picture_xl);
        }

        // Álbumes del artista desde Last.fm
        const resAlbumes = await fetch(
          `https://ws.audioscrobbler.com/2.0/?method=artist.gettopalbums&artist=${encodeURIComponent(artistName)}&api_key=${API_KEY}&format=json&autocorrect=1&limit=12`
        );
        const dataAlbumes = await resAlbumes.json();
        if (dataAlbumes.topalbums?.album) {
          const conImagen = dataAlbumes.topalbums.album.filter(
            a => a.image?.[3]?.['#text'] !== ''
          );
          setAlbumes(conImagen);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setCargando(false);
      }
    };

    fetchArtist();
  }, [artistName]);

  if (cargando) return <div className="artist-loading">Cargando artista...</div>;
  if (!artistInfo) return <div className="artist-loading">No se encontró el artista.</div>;

  const bio = artistInfo.bio?.summary?.split('<a href')[0] || 'Sin biografía disponible.';
  const oyentes = parseInt(artistInfo.stats?.listeners || 0).toLocaleString();

  return (
    <div className="artist-container">
      {/* Hero */}
      <div
        className="artist-hero"
        style={{ backgroundImage: `url(${imagen || 'https://via.placeholder.com/1200x400'})` }}
      >
        <div className="artist-hero-overlay">
          <button onClick={() => navigate(-1)} className="artist-back-btn">
            <IoArrowBack />
          </button>
          <div className="artist-hero-info">
            <p className="artist-type">Artista</p>
            <h1 className="artist-name">{artistInfo.name}</h1>
            <p className="artist-listeners">{oyentes} oyentes mensuales</p>
          </div>
        </div>
      </div>

      <div className="artist-body">
        {/* Bio */}
        {bio && (
          <section className="artist-bio">
            <h2>Sobre el artista</h2>
            <p>{bio}</p>
          </section>
        )}

        {/* Tags */}
        {artistInfo.tags?.tag?.length > 0 && (
          <div className="artist-tags">
            {artistInfo.tags.tag.map(tag => (
              <span key={tag.name} className="artist-tag">{tag.name}</span>
            ))}
          </div>
        )}

        {/* Álbumes */}
        {albumes.length > 0 && (
          <section className="artist-albums">
            <h2>Discografía</h2>
            <div className="artist-albums-grid">
              {albumes.map((album, index) => (
                <div
                  key={index}
                  className="artist-album-card"
                  onClick={() => navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(artistInfo.name)}`)}
                >
                  <img
                    src={album.image?.[3]?.['#text'] || 'https://via.placeholder.com/200'}
                    alt={album.name}
                  />
                  <h3>{album.name}</h3>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ArtistDetail;