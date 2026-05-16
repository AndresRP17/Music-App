import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

// 🚀 ACÁ MANEJÁS VOS LA HOME: Cambiá, sumá o sacá los discos que quieras por género
const MIS_ÁLBUMES_ELEGIDOS = {
  rock: [
    { name: "Back in Black", artist: "AC/DC" },
    { name: "AM", artist: "Arctic Monkeys" },
    { name: "Californication", artist: "Red Hot Chili Peppers" },
    { name: "Appetite for Destruction", artist: "Guns N' Roses" },
  { name: "The Dark Side of the Moon", artist: "Pink Floyd" },
  { name: "Highway to hell", artist: "AC/DC" },
  { name: "Abbey Road", artist: "The Beatles" },
  { name: "Appetite for Destruction", artist: "Guns N' Roses" },
  { name: "Phobia", artist: "Breaking Benjamin" },
  { name: "Californication", artist: "Red Hot Chili Peppers" },
  { name: "Nevermind", artist: "Nirvana" },
  { name: "A Night at the Opera", artist: "Queen" },
  { name: "Led Zeppelin IV", artist: "Led Zeppelin" },
  { name: "Rumours", artist: "Fleetwood Mac" },
  { name: "OK Computer", artist: "Radiohead" },
  { name: "Ten", artist: "Pearl Jam" },
  { name: "Wish You Were Here", artist: "Pink Floyd" },
  { name: "Hotel California", artist: "Eagles" }

  ],
  metal: 
[
  {name: "Hail to the king", artist: "Avenged Sevenfold"},
 {name: "Nightmare", artist: "Avenged Sevenfold"},
  { name: "Paranoid", artist: "Black Sabbath" },
  { name: "The Number of the Beast", artist: "Iron Maiden" },
  { name: "Master of Puppets", artist: "Metallica" },
  { name: "Rust in Peace", artist: "Megadeth" },
  { name: "British Steel", artist: "Judas Priest" },
  { name: "Painkiller", artist: "Judas Priest" },
  { name: "Powerslave", artist: "Iron Maiden" },
  { name: "Ride the Lightning", artist: "Metallica" },
  { name: "Reign in Blood", artist: "Slayer" },
  { name: "Cowboys from Hell", artist: "Pantera" },
  { name: "Vulgar Display of Power", artist: "Pantera" },
  { name: "Heaven and Hell", artist: "Black Sabbath" },
  { name: "Holy Diver", artist: "Dio" },
  { name: "Ace of Spades", artist: "Motörhead" },
  { name: "Operation: Mindcrime", artist: "Queensrÿche" }

  ],
  rnb: [
  { name: "After Hours", artist: "The Weeknd" },
  { name: "Starboy", artist: "The Weeknd" },
  { name: "Blonde", artist: "Frank Ocean" },
  { name: "Confessions", artist: "Usher" },
  { name: "Channel Orange", artist: "Frank Ocean" },
  { name: "Ctrl", artist: "SZA" },
  { name: "SOS", artist: "SZA" },
  { name: "Continuum", artist: "John Mayer" },
  { name: "The Miseducation of Lauryn Hill", artist: "Ms. Lauryn Hill" },
  { name: "Voodoo", artist: "D'Angelo" },
  { name: "IGOR", artist: "Tyler, The Creator" },
  { name: "Awaken, My Love!", artist: "Childish Gambino" }

  ],
  pop: [
  { name: "Thriller", artist: "Michael Jackson" },
  { name: "Future Nostalgia", artist: "Dua Lipa" },
  { name: "Fine Line", artist: "Harry Styles" },
  { name: "Random Access Memories", artist: "Daft Punk" },
  { name: "Bad", artist: "Michael Jackson" },
  { name: "Midnights", artist: "Taylor Swift" },
  { name: "Currents", artist: "Tame Impala" },
  { name: "Sour", artist: "Olivia Rodrigo" },
  { name: "Divide", artist: "Ed Sheeran" },
  { name: "24K Magic", artist: "Bruno Mars" },
  { name: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish" },
  { name: "Ray of Light", artist: "Madonna" }
]
};

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

  // --- Estado y Datos para el Carrusel del Hero ---
  const [heroIndex, setHeroIndex] = useState(0);

  const heroAlbums = [
    {
      title: "After Hours",
      artist: "The Weeknd",
      badge: "DESTACADO DEL DÍA",
      description: "Sumergite en la atmósfera nostálgica y oscura de The Weeknd.",
      link: "/album/After%20Hours/The%20Weeknd",
      bg: "https://preview.redd.it/whats-the-cover-art-for-after-hours-deluxe-shouldve-been-v0-dkxn9xp5n3u71.jpg?width=1080&crop=smart&auto=webp&s=d1acab865e34ea5471173493cdc0226b6fe40442"
    },
    {
      title: "The Number of the Beast",
      artist: "Iron Maiden",
      badge: "CLÁSICO IMPERDIBLE",
      description: "Woe to you, oh Earth and Sea... Un pilar fundamental del heavy metal.",
      link: "/album/The%20Number%20of%20the%20Beast/Iron%20Maiden",
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
    e.stopPropagation(); 
    setHeroIndex((prev) => (prev + 1) % heroAlbums.length);
  };

  const anteriorHero = (e) => {
    e.stopPropagation(); 
    setHeroIndex((prev) => (prev - 1 + heroAlbums.length) % heroAlbums.length);
  };

  const albumHeroActual = heroAlbums[heroIndex];
  // --------------------------------------------------------

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        // 1. Buscamos el top general de Argentina tal cual lo tenías
        const resTop = await fetch(`https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=argentina&api_key=${API_KEY}&format=json&limit=20`);
        const dataTop = await resTop.json();
        if (dataTop.albums) setTopAlbums(dataTop.albums.album);

        // 2. Función interna para traer la info e imágenes exactas de TUS listas elegidas
        const obtenerInfoPersonalizada = async (listaDiscos) => {
          const promesas = listaDiscos.map(async (disco) => {
            try {
              const res = await fetch(
                `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(disco.artist)}&album=${encodeURIComponent(disco.name)}&format=json`
              );
              const data = await res.json();
              
              if (data.album) return data.album;

              // Backup por si la API no encuentra el match exacto
              return {
                name: disco.name,
                artist: disco.artist,
                image: [{ '#text': '' }, { '#text': '' }, { '#text': '' }, { '#text': 'https://via.placeholder.com/300' }]
              };
            } catch {
              return {
                name: disco.name,
                artist: disco.artist,
                image: [{ '#text': '' }, { '#text': '' }, { '#text': '' }, { '#text': 'https://via.placeholder.com/300' }]
              };
            }
          });
          return Promise.all(promesas);
        };

        // 3. Resolvemos las búsquedas de tus listas personalizadas en paralelo
        const [rockData, metalData, rnbData, popData] = await Promise.all([
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.rock),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.metal),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.rnb),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.pop)
        ]);

        setRockAlbums(rockData);
        setMetalAlbums(metalData);
        setRnbAlbums(rnbData);
        setPopAlbums(popData);

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
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.85) 30%, rgba(0, 0, 0, 0.2) 80%), url(${albumHeroActual.bg})`,
          position: 'relative' // Asegura el orden de capas para tus flechas absolutas
        }}
      >
        {/* Flecha Izquierda */}
        <button className="hero-arrow arrow-left" onClick={anteriorHero} style={{ zIndex: 10 }}>‹</button>

        {/* Contenido dinámico renderizado según el index actual */}
        <div className="hero-content" style={{ zIndex: 5 }}>
          <span className="badge">{albumHeroActual.badge}</span>
          <h1>{albumHeroActual.title}</h1>
          <p>{albumHeroActual.description}</p>
          <button className="btn-hero">Escuchar ahora</button>
        </div>

        {/* Flecha Derecha */}
        <button className="hero-arrow arrow-right" onClick={siguienteHero} style={{ zIndex: 10 }}>›</button>
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