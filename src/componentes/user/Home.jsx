/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Publicidad from './Publicidad';
import { usePublicidad } from '../../hooks/usePublicidad';
import './styles/Home.css';

const MIS_ÁLBUMES_ELEGIDOS = {
  global: [
    { name: "Thriller", artist: "Michael Jackson" },
    { name: "Abbey Road", artist: "The Beatles" },
    { name: "The Dark Side of the Moon", artist: "Pink Floyd" },
    { name: "Wish You Were Here", artist: "Pink Floyd" },
    { name: "Seventh son of a seventh son", artist: "Iron Maiden" },
    { name: "Somewhere in Time", artist: "Iron Maiden" },
    { name: "Peace sells... but whos buying?", artist: "Megadeth" },
    { name: "Master of Puppets", artist: "Metallica" },
    {name:"Post Human: Nex Gen", artist:"Bring Me the Horizon"},
    { name: "Discovery", artist: "Daft Punk" },
    { name: "Debí tirar más fotos", artist: "Bad Bunny" }
  ],
  rock: [
    { name: "Back in Black", artist: "AC/DC" },
    { name: "AM", artist: "Arctic Monkeys" },
    { name: "Californication", artist: "Red Hot Chili Peppers" },
    { name: "Appetite for Destruction", artist: "Guns N' Roses" },
    { name: "The Dark Side of the Moon", artist: "Pink Floyd" },
    { name: "Highway to hell", artist: "AC/DC" },
    { name: "Dark Necessities", artist: "Red Hot Chili Peppers" },
    { name: "Phobia", artist: "Breaking Benjamin" },
    { name: "Nevermind", artist: "Nirvana" },
    { name: "A Night at the Opera", artist: "Queen" },
    { name: "Led Zeppelin IV", artist: "Led Zeppelin" },
    { name: "Rumours", artist: "Fleetwood Mac" },
    { name: "OK Computer", artist: "Radiohead" },
    { name: "Ten", artist: "Pearl Jam" },
    { name: "Wish You Were Here", artist: "Pink Floyd" },
    { name: "Hotel California", artist: "Eagles" }
  ],
  metal: [
    { name: "Hail to the king", artist: "Avenged Sevenfold" },
    { name: "Nightmare", artist: "Avenged Sevenfold" },
    { name: "Paranoid", artist: "Black Sabbath" },
    { name: "The Number of the Beast", artist: "Iron Maiden" },
    { name: "Killing Is My Business...And Business Is Good!", artist: "Megadeth" },
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
    {name: "Mate.Feed.Kill.Repeat", artist: "Slipknot"},
    { name: "Holy Diver", artist: "Dio" },
    { name: "Ace of Spades", artist: "Motörhead" },
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
    { name: "Bad", artist: "Michael Jackson" },
    { name: "Future Nostalgia", artist: "Dua Lipa" },
    { name: "Random Access Memories", artist: "Daft Punk" },
    { name: "Midnights", artist: "Taylor Swift" },
    { name: "Currents", artist: "Tame Impala" },
    { name: "Sour", artist: "Olivia Rodrigo" },
    { name: "Divide", artist: "Ed Sheeran" },
    { name: "24K Magic", artist: "Bruno Mars" },
    { name: "When We All Fall Asleep, Where Do We Go?", artist: "Billie Eilish" },
    { name: "Ray of Light", artist: "Madonna" }
  ],

  numetal: [
  { name: "Hybrid Theory", artist: "Linkin Park" },
  { name: "Meteora", artist: "Linkin Park" },
  { name: "Issues", artist: "Korn" },
  { name: "Follow the Leader", artist: "Korn" },
  { name: "Significant Other", artist: "Limp Bizkit" },
  { name: "Chocolate Starfish and the Hot Dog Flavored Water", artist: "Limp Bizkit" },
  { name: "Vol. 3: The Subliminal Verses", artist: "Slipknot" },
  { name: "Iowa", artist: "Slipknot" },
  { name: "White Pony", artist: "Deftones" },
  { name: "Adrenaline", artist: "Deftones" },
  { name: "Toxicity", artist: "System of a Down" },
  { name: "Mezmerize", artist: "System of a Down" },
],
metalcore: [
  { name: "Sempiternal", artist: "Bring Me the Horizon" },
  { name: "True power", artist: "I prevail" },
  { name: "Violent Nature", artist: "I prevail" },
  { name: "Pray", artist: "Vana" },
  { name: "That's The Spirit", artist: "Bring me the Horizon" },
  { name: "BITE BACK", artist: "Vana" },
  { name: "Reckless & Relentless", artist: "Asking Alexandria" },
  { name: "Step 2 Rhythm", artist: "Turnstile" },
  { name: "The Devil and God Are Raging Inside Me", artist: "Brand New" },
  { name: "Waking the Fallen", artist: "Avenged Sevenfold" },
  { name: "City of Evil", artist: "Avenged Sevenfold" }
]
};

function Home() {
  // 🌟 PASO 1: ESTADO INICIAL DEL ROL LEYENDO DEL STORAGE
  const [role, setRole] = useState(() => localStorage.getItem("role") || "user");

  const [topAlbums, setTopAlbums] = useState([]);
  const [rockAlbums, setRockAlbums] = useState([]);
  const [metalAlbums, setMetalAlbums] = useState([]);
  const [rnbAlbums, setRnbAlbums] = useState([]);
  const [popAlbums, setPopAlbums] = useState([]);
  const [numetalAlbums, setNumetalAlbums] = useState([]);
  const [metalcoreAlbums, setMetalcoreAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);

  const { mostrarPublicidad, conPublicidad, cerrarYContinuar } = usePublicidad();

  const navigate = useNavigate();
  const topRef = useRef(null);
  const rockRef = useRef(null);
  const metalRef = useRef(null);
  const rnbRef = useRef(null);
  const popRef = useRef(null);
  const numetalRef = useRef(null);
  const metalcoreRef = useRef(null);

  const API_KEY = 'aa182e9e95ab101a5f7ae68eba441e09';

  // Variable rápida para los condicionales
  const esPremium = role === "premium" || role === "admin";

  // 🌟 PASO 2: ESCUCHADOR EN TIEMPO REAL
  useEffect(() => {
    const handleRolActualizado = () => {
      setRole(localStorage.getItem("role") || "user");
    };
    window.addEventListener("rolActualizado", handleRolActualizado);
    return () => window.removeEventListener("rolActualizado", handleRolActualizado);
  }, []);

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

  useEffect(() => {
    const fetchHomeData = async () => {
      // Re-chequeo veloz antes de cargar la API
      setRole(localStorage.getItem("role") || "user");
      try {
        const obtenerInfoPersonalizada = async (listaDiscos) => {
          const promesas = listaDiscos.map(async (disco) => {
            try {
              const res = await fetch(
                `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${API_KEY}&artist=${encodeURIComponent(disco.artist)}&album=${encodeURIComponent(disco.name)}&format=json`
              );
              const data = await res.json();
              if (data.album) return data.album;
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

        const [globalData, rockData, metalData, rnbData, popData, numetalData, metalcoreData] = await Promise.all([
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.global),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.rock),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.metal),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.rnb),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.pop),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.numetal),
          obtenerInfoPersonalizada(MIS_ÁLBUMES_ELEGIDOS.metalcore),
        ]);

        setTopAlbums(globalData);
        setRockAlbums(rockData);
        setMetalAlbums(metalData);
        setRnbAlbums(rnbData);
        setPopAlbums(popData);
        setNumetalAlbums(numetalData);
        setMetalcoreAlbums(metalcoreData);
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
      ref.current.scrollLeft += direction === 'left' ? -600 : 600;
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

    // 🌟 BENEFICIO PREMIUM: Si paga, entra directo. Si es gratis, tiene publicidad.
    if (esPremium) {
      navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
    } else {
      conPublicidad(() => {
        navigate(`/album/${encodeURIComponent(album.name)}/${encodeURIComponent(nombreArtista)}`);
      });
    }
  };

  // 🌟 PASO 3: RECTIFICACIÓN DE LOS BOTONES CON LA CLASE PREMIUM-HOVER
  const renderSection = (titulo, albums, referencia) => (
    <section className="home-section">
      <div className="section-header">
       <h2 
  style={{ 
    borderLeft: (role === "premium" || role === "admin") ? '5px solid #d0b412' : '5px solid #ff2d55' 
  }}
>
  {titulo}
</h2>
        <div className="carousel-controls">
          {/* Se inyecta la clase 'premium-hover' si corresponde */}
          <button className={esPremium ? "premium-hover" : ""} onClick={() => scroll(referencia, 'left')}>‹</button>
          <button className={esPremium ? "premium-hover" : ""} onClick={() => scroll(referencia, 'right')}>›</button>
        </div>
      </div>
      <div className="home-carousel" ref={referencia}>
        {albums && albums.length > 0 ? (
          albums.map((album, index) => (
            <div
  key={`${titulo}-${index}`}
  className="home-card"
  onClick={() => manejarClickAlbum(album)}
  style={{ borderBottom: esPremium ? '3px solid #d0b412' : ''
    
   }}
>
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
          <p className="loading-text" style={{ color: esPremium ? '#d0b412' : '' }}>Cargando sección...</p>
        )}
      </div>
    </section>
  );

  if (loading) return <div className="loading" style={{ color: esPremium ? '#d0b412' : '' }}>Preparando tu música...</div>;

  return (
    <div className="home-container">

      {/* Solo mostramos publicidad si NO es premium */}
      {!esPremium && mostrarPublicidad && (
        <Publicidad onCerrar={cerrarYContinuar} />
      )}

      <section
        className="hero-section"
        onClick={() => navigate(albumHeroActual.link)}
        style={{
          cursor: 'pointer',
          backgroundImage: `url(${albumHeroActual.bg})`,
          position: 'relative',
          borderBottom: esPremium ? '4px solid #FFD700' : '' // Detalle premium abajo del banner
        }}
      >
<button 
  className={`hero-arrow arrow-left ${(role === "premium" || role === "admin") ? "premium-hover" : ""}`} 
  onClick={anteriorHero} 
  style={{ zIndex: 10 }}
>
  ‹
</button>        <div className="hero-content" style={{ zIndex: 5 }}>
          <span className="badge" style={{ backgroundColor: esPremium ? '#d0b412' : '', color: esPremium ? '#000' : '' }}>
            {albumHeroActual.badge} {esPremium && "👑"}
          </span>
          <h1>{albumHeroActual.title}</h1>
          <p>{albumHeroActual.description}</p>
          <button className="btn-hero" style={{ backgroundColor: esPremium ? '#d0b412' : '', color: esPremium ? '#000' : '' }}>
            Escuchar ahora
          </button>
        </div>
<button 
  className={`hero-arrow arrow-right ${(role === "premium" || role === "admin") ? "premium-hover" : ""}`} 
  onClick={siguienteHero} 
  style={{ zIndex: 10 }}
>
  ›
</button>      </section>

      {renderSection("Top Global Seleccionado", topAlbums, topRef)}
      {renderSection("Rock Internacional", rockAlbums, rockRef)}
      {renderSection("Puro Metal", metalAlbums, metalRef)}
      {renderSection("Vibras R&B", rnbAlbums, rnbRef)}
      {renderSection("Lo mejor del Pop", popAlbums, popRef)}
      {renderSection("Nu Metal", numetalAlbums, numetalRef)}
{renderSection("Metalcore", metalcoreAlbums, metalcoreRef)}
    </div>
  );
}

export default Home;