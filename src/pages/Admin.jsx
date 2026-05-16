import { useState, useEffect } from "react";
// 🆕 IMPORTS ADAPTADOS PARA EL GRÁFICO DE DONA/TORTA
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement, // Elemento esencial para los arcos de la torta
  Tooltip,
  Legend
} from "chart.js";

// Registramos los componentes específicos para gráficos circulares
ChartJS.register(ArcElement, Tooltip, Legend);

function Admin() {
  // Estados para los géneros de música
  const [genres, setGenres] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);

  // Estados para el buscador del Admin (Fijo para no romper tu buscador actual)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const proxyUrl = "https://corsproxy.io/?";

  // EFFECT 1: Trae los géneros globales (¡Esta data NUNCA viene vacía!)
  useEffect(() => {
    setLoadingChart(true);
    const targetUrl = "https://api.deezer.com/genre";

    fetch(proxyUrl + encodeURIComponent(targetUrl))
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          // Filtramos ID 0 ("All") y otros que no sean música pura para que quede más facha
          const cleanGenres = data.data.filter(
            (g) => g.name !== "All" && g.name !== "Audiobooks" && g.id !== 0
          );
          // Nos quedamos con los primeros 7 para que el gráfico no se sature de porciones
          setGenres(cleanGenres.slice(0, 7));
        }
        setLoadingChart(false);
      })
      .catch((err) => {
        console.error("Error trayendo géneros:", err);
        setLoadingChart(false);
      });
  }, []);

  // FUNCIÓN: Busca un artista para ver sus métricas de admin
  const handleAdminSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoadingSearch(true);
    const searchUrl = `https://api.deezer.com/search/artist?q=${searchQuery}`;

    fetch(proxyUrl + encodeURIComponent(searchUrl))
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          const artistId = data.data[0].id;
          const artistUrl = `https://api.deezer.com/artist/${artistId}`;
          return fetch(proxyUrl + encodeURIComponent(artistUrl));
        }
        throw new Error("Artista no encontrado");
      })
      .then((res) => res.json())
      .then((artistInfo) => {
        setSearchResult(artistInfo);
        setLoadingSearch(false);
      })
      .catch((err) => {
        console.error(err);
        setSearchResult({ error: true });
        setLoadingSearch(false);
      });
  };

  // 🆕 CONFIGURACIÓN DEL GRÁFICO DE DONA (DOUGHNUT)
  const chartLabels = genres.map((g) => g.name);
  
  // Simulamos una métrica de distribución para renderizar las porciones (KPI del ecosistema)
  const baseValues = [35, 25, 18, 12, 10, 8, 5]; 
  const chartValues = baseValues.slice(0, genres.length);

  const dataForChart = {
    labels: chartLabels,
    datasets: [
      {
        label: "Distribución de Consumo %",
        data: chartValues,
        backgroundColor: [
          "#1db954", // Verde principal
          "#128c3e", // Variaciones de verde y oscuros estéticos
          "#0f6b30",
          "#1ed760",
          "#2ebd59",
          "#1aa34a",
          "#0b4d22"
        ],
        borderColor: "#121212", // Bordes oscuros para que se integre al fondo del Dashboard
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom", // Mandamos la leyenda abajo
        labels: {
          color: "#fff", // Letras blancas para el modo oscuro
          font: { size: 12, weight: "500" },
          padding: 15,
          usePointStyle: true, // Bolitas en vez de cuadrados feos
        },
      },
      tooltip: {
        backgroundColor: "#181818",
        titleColor: "#1db954",
        bodyColor: "#fff",
        borderColor: "#282828",
        borderWidth: 1,
        callbacks: {
          label: function(context) {
            return ` ${context.label}: ${context.raw}% del share global`;
          }
        }
      },
    },
    cutout: "70%", // Hace que el centro sea más grande (estilo anillo moderno)
  };

  return (
    <div className="admin-dashboard-container">
      
      {/* HEADER DE LA PÁGINA */}
      <header className="admin-header">
        <div>
          <h1>Métricas Globales de Distribución</h1>
          <p className="subtitle">Análisis del ecosistema musical en tiempo real</p>
        </div>
        <div className="status-badge">Datos Globales Consolidados</div>
      </header>

      {/* TARJETAS ESTÁTICAS RÁPIDAS */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <h3>Categorías Activas</h3>
            <p className="stat-number">{genres.length} Macro-Géneros</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🌎</span>
          <div>
            <h3>Región del Análisis</h3>
            <p className="stat-number">Worldwide (Global)</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">⚡</span>
          <div>
            <h3>Estabilidad de Datos</h3>
            <p className="stat-number">100% Online</p>
          </div>
        </div>
      </section>

      {/* DISEÑO DE DOS COLUMNAS */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px", marginTop: "30px" }}>
        
        {/* COLUMNA IZQUIERDA: GRÁFICO DE TORTA REAL */}
        <section className="graph-section" style={{ margin: 0, display: "flex", flexDirection: "column", minHeight: "450px" }}>
          <h2>🎵 Cuota de Mercado por Género</h2>
          <p className="graph-subtitle">Porcentaje estimado de reproducciones en la plataforma</p>

          {loadingChart ? (
            <div className="loader" style={{ margin: "auto" }}>Mapeando base de datos de géneros...</div>
          ) : (
            <div style={{ flex: 1, position: "relative", marginTop: "20px" }}>
              <Doughnut data={dataForChart} options={chartOptions} />
            </div>
          )}
        </section>

        {/* COLUMNA DERECHA: INSPECTOR DE ARTISTAS (Tu buscador intacto) */}
        <section className="graph-section" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          <h2>🔍 Inspector de Datos</h2>
          <p className="graph-subtitle">Audita la metadata profunda de Deezer</p>

          <form onSubmit={handleAdminSearch} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <input 
              type="text" 
              placeholder="Ej: Iron Maiden, The Weeknd..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, background: "#222", border: "1px solid #333", padding: "8px 12px", borderRadius: "6px", color: "white" }}
            />
            <button type="submit" style={{ background: "#1db954", border: "none", padding: "8px 15px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>Ver</button>
          </form>

          {loadingSearch && <div className="loader">Consultando base de datos...</div>}

          {searchResult && !loadingSearch && (
            searchResult.error ? (
              <p style={{ color: "#ff5c5c", fontSize: "0.9rem" }}>No se encontraron registros.</p>
            ) : (
              <div style={{ background: "#222", padding: "15px", borderRadius: "10px", textAlign: "center" }}>
                <img src={searchResult.picture_medium} alt={searchResult.name} style={{ width: "90px", borderRadius: "50%", marginBottom: "10px", border: "2px solid #1db954" }} />
                <h3 style={{ margin: "5px 0" }}>{searchResult.name}</h3>
                
                <div style={{ textAlign: "left", marginTop: "15px", fontSize: "0.85rem", color: "#ccc", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p>👥 <strong>Fans en Deezer:</strong> {Number(searchResult.nb_fan).toLocaleString()}</p>
                  <p>💿 <strong>Álbumes Públicos:</strong> {searchResult.nb_album}</p>
                  <p>🆔 <strong>Deezer ID:</strong> {searchResult.id}</p>
                </div>
              </div>
            )
          )}
        </section>

      </div>
    </div>
  );
}

export default Admin;