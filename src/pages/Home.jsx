import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const [topAlbums, setTopAlbums] = useState([]);
  const [rockAlbums, setRockAlbums] = useState([]); 
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

  // --- NUEVO: Estado y Datos para el Carrusel del Hero ---
  const [heroIndex, setHeroIndex] = useState(0);

  
    const heroAlbums = [
  {
    title: "After Hours",
    artist: "The Weeknd",
    badge: "DESTACADO DEL DÍA",
    description: "Sumergite en la atmósfera nostálgica y oscura de The Weeknd.",
    link: "/album/After%20Hours/The%20Weeknd",
    // Tu imagen actual de After Hours
    bg: "https://preview.redd.it/whats-the-cover-art-for-after-hours-deluxe-shouldve-been-v0-dkxn9xp5n3u71.jpg?width=1080&crop=smart&auto=webp&s=d1acab865e34ea5471173493cdc0226b6fe40442"
  },
  {
    title: "The Number of the Beast",
    artist: "Iron Maiden",
    badge: "CLÁSICO IMPERDIBLE",
    description: "Woe to you, oh Earth and Sea... Un pilar fundamental del heavy metal.",
    link: "/album/The%20Number%20of%20the%20Beast/Iron%20Maiden",
    // URL directa a una imagen del álbum o la banda
    bg: "https://akamai.sscdn.co/uploadfile/letras/albuns/2/3/7/d/201381753731047.jpg" 
  },
  {
    title: "Starboy",
    artist: "The Weeknd",
    badge: "VIBRAS NOCTURNAS",
    description: "Un viaje de pop psicodélico, R&B y ritmos electrónicos electrizantes.",
    link: "/album/Starboy/The%20Weeknd",
    bg: "https://indiehoy.com/wp-content/uploads/2016/10/the-weeknd-starboy.jpg"
  },
  {
    title: "Senjutsu",
    artist: "Iron Maiden",
    badge: "JOYA DEL METAL",
    description: "Viajá al antiguo Japon con riffs galopantes y solos legendarios.",
    link: "/album/Senjutsu/Iron%20Maiden",
    bg: "https://www.hellpress.com/wp-content/uploads/2021/07/iron-maiden-senjutsu-1024x1024.jpg"
  }

  ];

  const siguienteHero = (e) => {
    e.stopPropagation(); // Evita que se active el click de la sección trasera
    setHeroIndex((prev) => (prev + 1) % heroAlbums.length);
  };

  const anteriorHero = (e) => {
    e.stopPropagation(); // Evita que se active el click de la sección trasera
    setHeroIndex((prev) => (prev - 1 + heroAlbums.length) % heroAlbums.length);
  };

  const albumHeroActual = heroAlbums[heroIndex];
  // --------------------------------------------------------

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [resTop, resRock, resMetal, resRnb, resPop] = await Promise.all([
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=argentina&api_key=${API_KEY}&format=json&limit=20`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=classic rock&api_key=${API_KEY}&format=json&limit=20`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=heavy metal&api_key=${API_KEY}&format=json&limit=20`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=rnb&api_key=${API_KEY}&format=json&limit=20`),
          fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=pop&api_key=${API_KEY}&format=json&limit=20`)
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
      
      {/* SECCIÓN HERO DINÁMICA CON FLECHAS */}
      <section 
        className="hero-section" 
        onClick={() => navigate(albumHeroActual.link)}
        style={{ 
          cursor: 'pointer',
          /* Agregamos el degradado y la URL dinámica de la portada acá */
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.2) 80%), url(${albumHeroActual.bg})`
        }}
      >
        {/* Flecha Izquierda */}
        <button className="hero-arrow arrow-left" onClick={anteriorHero}>‹</button>

        {/* Contenido dinámico renderizado según el index actual */}
        <div className="hero-content">
          <span className="badge">{albumHeroActual.badge}</span>
          <h1>{albumHeroActual.title}</h1>
          <p>{albumHeroActual.description}</p>
          <button className="btn-hero">Escuchar ahora</button>
        </div>

        {/* Flecha Derecha */}
        <button className="hero-arrow arrow-right" onClick={siguienteHero}>›</button>
      </section>

      {/* Secciones de los carruseles inferiores */}
      {renderSection("Lo más escuchado en Argentina", topAlbums, topRef)}
      {renderSection("Rock Internacional", rockAlbums, rockRef)}
      {renderSection("Puro Metal", metalAlbums, metalRef)}
      {renderSection("Vibras R&B", rnbAlbums, rnbRef)}
      {renderSection("Lo mejor del Pop", popAlbums, popRef)}
    </div>
  );
}

export default Home;