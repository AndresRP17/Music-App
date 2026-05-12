import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [topAlbums, setTopAlbums] = useState([]);
  const [metalAlbums, setMetalAlbums] = useState([]);
  const [rnbAlbums, setRnbAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Referencias para las flechas de los carruseles
  const topRef = useRef(null);
  const metalRef = useRef(null);
  const rnbRef = useRef(null);

  const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // Usamos etiquetas populares para evitar el error 400 del método chart
        const resTop = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=popular&api_key=${API_KEY}&format=json&limit=12`);
        const dataTop = await resTop.json();

        const resMetal = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=heavy metal&api_key=${API_KEY}&format=json&limit=12`);
        const dataMetal = await resMetal.json();

        const resRnb = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=rnb&api_key=${API_KEY}&format=json&limit=12`);
        const dataRnb = await resRnb.json();

        if (dataTop.albums) setTopAlbums(dataTop.albums.album);
        if (dataMetal.albums) setMetalAlbums(dataMetal.albums.album);
        if (dataRnb.albums) setRnbAlbums(dataRnb.albums.album);

        setLoading(false);
      } catch (error) {
        console.error("Error cargando el inicio:", error);
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const scroll = (ref, direction) => {
    if (direction === 'left') {
      ref.current.scrollLeft -= 500;
    } else {
      ref.current.scrollLeft += 500;
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

  if (loading) return <div className="loading">Cargando tu música...</div>;

  return (
    <div className="home-container">
      {/* --- HERO SECTION --- */}
      <section className="hero-section" onClick={() => navigate('/album/After%20Hours/The%20Weeknd')}>
        <div className="hero-content">
          <span className="badge">DESTACADO DEL DÍA</span>
          <h1>After Hours</h1>
          <p>Sumergite en la atmósfera nostálgica y oscura de The Weeknd.</p>
          <button className="btn-hero">Escuchar ahora</button>
        </div>
      </section>

      {/* --- SECCIÓN TENDENCIAS --- */}
      <section className="home-section">
        <div className="section-header">
          <h2>Tendencias Globales</h2>
          <div className="carousel-controls">
            <button onClick={() => scroll(topRef, 'left')}>‹</button>
            <button onClick={() => scroll(topRef, 'right')}>›</button>
          </div>
        </div>
        <div className="home-carousel" ref={topRef}>
          {topAlbums.map((album, index) => (
            <div key={index} className="home-card" onClick={() => manejarClickAlbum(album)}>
              <img src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} alt={album.name} />
              <div className="home-card-info">
                <h3>{album.name}</h3>
                <p>{album.artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN METAL --- */}
      <section className="home-section">
        <div className="section-header">
          <h2>Puro Metal</h2>
          <div className="carousel-controls">
            <button onClick={() => scroll(metalRef, 'left')}>‹</button>
            <button onClick={() => scroll(metalRef, 'right')}>›</button>
          </div>
        </div>
        <div className="home-carousel" ref={metalRef}>
          {metalAlbums.map((album, index) => (
            <div key={index} className="home-card" onClick={() => manejarClickAlbum(album)}>
              <img src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} alt={album.name} />
              <div className="home-card-info">
                <h3>{album.name}</h3>
                <p>{album.artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECCIÓN R&B --- */}
      <section className="home-section">
        <div className="section-header">
          <h2>Vibras R&B</h2>
          <div className="carousel-controls">
            <button onClick={() => scroll(rnbRef, 'left')}>‹</button>
            <button onClick={() => scroll(rnbRef, 'right')}>›</button>
          </div>
        </div>
        <div className="home-carousel" ref={rnbRef}>
          {rnbAlbums.map((album, index) => (
            <div key={index} className="home-card" onClick={() => manejarClickAlbum(album)}>
              <img src={album.image[3]['#text'] || 'https://via.placeholder.com/300'} alt={album.name} />
              <div className="home-card-info">
                <h3>{album.name}</h3>
                <p>{album.artist.name}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;