import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [topAlbums, setTopAlbums] = useState([]);
  const [rockAlbums, setRockAlbums] = useState([]); // Nueva sección
  const [metalAlbums, setMetalAlbums] = useState([]);
  const [rnbAlbums, setRnbAlbums] = useState([]);
  const [popAlbums, setPopAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const topRef = useRef(null);
  const rockRef = useRef(null);
  const metalRef = useRef(null);
  const rnbRef = useRef(null);
  const popRef = useRef(null);

  const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [resTop, resRock, resMetal, resRnb, resPop] = await Promise.all([
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=argentina&api_key=${API_KEY}&format=json&limit=15`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=classic rock&api_key=${API_KEY}&format=json&limit=15`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=heavy metal&api_key=${API_KEY}&format=json&limit=15`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=rnb&api_key=${API_KEY}&format=json&limit=15`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=pop&api_key=${API_KEY}&format=json&limit=15`)
        ]);

        const dataTop = await resTop.json();
        const dataRock = await resRock.json();
        const dataMetal = await resMetal.json();
        const dataRnb = await resRnb.json();
        const dataPop = await resPop.json();

        if (dataTop.albums) setTopAlbums(dataTop.albums.album);
        if (dataRock.albums) setRockAlbums(dataRock.albums.album);
        if (dataMetal.albums) setMetalAlbums(dataMetal.albums.album);
        if (dataRnb.albums) setRnbAlbums(dataRnb.albums.album);
        if (dataPop.albums) setPopAlbums(dataPop.albums.album);

        setLoading(false);
      } catch (error) {
        console.error("Error cargando el inicio:", error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = 600;
      ref.current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
    }
  };

  const manejarClickAlbum = (album) => {
    const nombreArtista = typeof album.artist === 'object' ? album.artist.name : album.artist;
    const historialActual = JSON.parse(localStorage.getItem('historialBusqueda')) || [];
    
    const nuevoHistorial = [
      { name: album.name, artist: nombreArtista, image: album.image },
      ...historialActual.filter(item => item.name !== album.name)
    ].slice(0, 5);
    
    localStorage.setItem('historialBusqueda', JSON.stringify(nuevoHistorial));
    navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
  };

  const renderSection = (titulo, albums, referencia) => (
    <section className="home-section">
      <div className="section-header">
        <h2>{titulo}</h2>
        <div className="carousel-controls">
          <button onClick={() => scroll(referencia, 'left')}>‹</button>
          <button onClick={() => scroll(referencia, 'right')}>›</button>
        </div>
      </div>
      <div className="home-carousel" ref={referencia}>
        {albums && albums.length > 0 ? (
          albums.map((album, index) => (
            <div key={`${titulo}-${index}`} className="home-card" onClick={() => manejarClickAlbum(album)}>
              <img 
                src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} 
                alt={album.name} 
              />
              <div className="home-card-info">
                <h3>{album.name}</h3>
                <p>{typeof album.artist === 'object' ? album.artist.name : album.artist}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-text">Cargando sección...</p>
        )}
      </div>
    </section>
  );

  if (loading) return <div className="loading">Preparando tu música...</div>;

  return (
    <div className="home-container">
      <section className="hero-section" onClick={() => navigate('/album/After%20Hours/The%20Weeknd')}>
        <div className="hero-content">
          <span className="badge">DESTACADO DEL DÍA</span>
          <h1>After Hours</h1>
          <p>Sumergite en la atmósfera nostálgica y oscura de The Weeknd.</p>
          <button className="btn-hero">Escuchar ahora</button>
        </div>
      </section>

      {renderSection("Lo más escuchado en Argentina", topAlbums, topRef)}
      {renderSection("Rock Internacional", rockAlbums, rockRef)}
      {renderSection("Puro Metal", metalAlbums, metalRef)}
      {renderSection("Vibras R&B", rnbAlbums, rnbRef)}
      {renderSection("Lo mejor del Pop", popAlbums, popRef)}
    </div>
  );
}

export default Home;