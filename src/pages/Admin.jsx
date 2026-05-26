import { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Admin() {
  const [genres, setGenres] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // ── NUEVO: estados para estadísticas del usuario ──
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // EFFECT 1: Géneros globales de Deezer
  useEffect(() => {
    setLoadingChart(true);
    fetch("/deezer/genre")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          const cleanGenres = data.data.filter(
            (g) => g.name !== "All" && g.name !== "Audiobooks" && g.id !== 0
          );
          setGenres(cleanGenres.slice(0, 7));
        }
        setLoadingChart(false);
      })
      .catch((err) => {
        console.error("Error trayendo géneros:", err);
        setLoadingChart(false);
      });
  }, []);

  // ── NUEVO EFFECT: Trae favoritos del usuario y calcula estadísticas ──
  useEffect(() => {
    setLoadingStats(true);
    fetch("http://localhost:8086/favorites")
      .then((res) => res.json())
      .then((data) => {
        // Contamos artistas
        const artistCount = {};
        const albumCount = {};
        const genreCount = {};

        data.forEach((c) => {
          if (c.artist) artistCount[c.artist] = (artistCount[c.artist] || 0) + 1;
          if (c.album)  albumCount[c.album]   = (albumCount[c.album]   || 0) + 1;
          if (c.genre && c.genre !== "Unknown")
            genreCount[c.genre] = (genreCount[c.genre] || 0) + 1;
        });

        // Ordenamos de mayor a menor y tomamos el top
        const sortTop = (obj, n = 5) =>
          Object.entries(obj)
            .sort((a, b) => b[1] - a[1])
            .slice(0, n);

        setUserStats({
          total: data.length,
          topArtists: sortTop(artistCount, 5),
          topAlbums:  sortTop(albumCount, 5),
          topGenres:  sortTop(genreCount, 5),
        });
        setLoadingStats(false);
      })
      .catch((err) => {
        console.error("Error trayendo favoritos:", err);
        setLoadingStats(false);
      });
  }, []);

  // Gráfico de dona (géneros globales)
  const chartLabels = genres.map((g) => g.name);
  const baseValues = [35, 25, 18, 12, 10, 8, 5];
  const chartValues = baseValues.slice(0, genres.length);

  const dataForChart = {
    labels: chartLabels,
    datasets: [{
      label: "Distribución de Consumo %",
      data: chartValues,
      backgroundColor: ["#1db954","#d6e109","#051a67","#e70404","#be1588","#0e7187","#0c0c0c"],
      borderColor: "#121212",
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#fff", font: { size: 12, weight: "500" }, padding: 15, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: "#181818", titleColor: "#1db954", bodyColor: "#fff",
        borderColor: "#282828", borderWidth: 1,
        callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.raw}% del share global` }
      },
    },
    cutout: "70%",
  };

  // ── Gráfico de barras: artistas más guardados ──
  const barData = userStats ? {
    labels: userStats.topArtists.map(([name]) => name),
    datasets: [{
      label: "Canciones guardadas",
      data: userStats.topArtists.map(([, count]) => count),
      backgroundColor: ["#1db954cc","#d6e109cc","#e70404cc","#be1588cc","#0e7187cc"],
      borderColor:     ["#1db954",  "#d6e109",  "#e70404",  "#be1588",  "#0e7187"],
      borderWidth: 2,
      borderRadius: 6,
    }],
  } : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#181818", titleColor: "#1db954", bodyColor: "#fff",
        callbacks: { label: (ctx) => ` ${ctx.raw} canción${ctx.raw !== 1 ? "es" : ""} guardada${ctx.raw !== 1 ? "s" : ""}` }
      },
    },
    scales: {
      x: { ticks: { color: "#aaa", font: { size: 11 } }, grid: { color: "#222" } },
      y: { ticks: { color: "#aaa", stepSize: 1 }, grid: { color: "#222" }, beginAtZero: true },
    },
  };

  const MEDAL = ["🥇","🥈","🥉","4️⃣","5️⃣"];

  return (
    <div className="admin-dashboard-container">

      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1>Métricas Globales de Distribución</h1>
          <p className="subtitle">Análisis del ecosistema musical en tiempo real</p>
        </div>
        <div className="status-badge">Datos Globales Consolidados</div>
      </header>

      {/* TARJETAS RÁPIDAS */}
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
        {/* ── NUEVA TARJETA: total de favoritos ── */}
        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <div>
            <h3>Canciones Guardadas</h3>
            <p className="stat-number">{loadingStats ? "..." : `${userStats?.total ?? 0} canciones`}</p>
          </div>
        </div>
      </section>

      {/* FILA 1: Dona global + Barras de artistas */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "30px", marginTop: "30px" }}>

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

        {/* ── NUEVO: Gráfico de barras artistas ── */}
        <section className="graph-section" style={{ margin: 0, display: "flex", flexDirection: "column", minHeight: "450px" }}>
          <h2>🎤 Tus Artistas Más Guardados</h2>
          <p className="graph-subtitle">Basado en tu playlist personal</p>
          {loadingStats ? (
            <div className="loader" style={{ margin: "auto" }}>Analizando tus gustos...</div>
          ) : barData ? (
            <div style={{ flex: 1, position: "relative", marginTop: "20px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <p style={{ color: "#aaa", marginTop: "20px" }}>No hay datos todavía.</p>
          )}
        </section>

      </div>

      {/* ── NUEVA FILA 2: Rankings de álbumes y géneros del usuario ── */}
      {!loadingStats && userStats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "30px" }}>

          {/* Ranking álbumes */}
          <section className="graph-section" style={{ margin: 0 }}>
            <h2>💿 Álbumes Más Guardados</h2>
            <p className="graph-subtitle">Los álbumes de los que más canciones tenés</p>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {userStats.topAlbums.length === 0 && <p style={{ color: "#aaa" }}>Sin datos.</p>}
              {userStats.topAlbums.map(([album, count], i) => {
                const pct = Math.round((count / userStats.total) * 100);
                return (
                  <div key={album}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                      <span style={{ color: "#eee", fontSize: "0.9rem" }}>
                        {MEDAL[i]} {album}
                      </span>
                      <span style={{ color: "#1db954", fontWeight: "bold", fontSize: "0.85rem" }}>
                        {count} canción{count !== 1 ? "es" : ""}
                      </span>
                    </div>
                    <div style={{ background: "#222", borderRadius: "4px", height: "6px", overflow: "hidden" }}>
                      <div style={{
                        width: `${pct}%`, height: "100%",
                        background: "linear-gradient(90deg, #1db954, #d6e109)",
                        borderRadius: "4px",
                        transition: "width 0.8s ease"
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Ranking géneros del usuario */}
          <section className="graph-section" style={{ margin: 0 }}>
            <h2>🎸 Tus Géneros Favoritos</h2>
            <p className="graph-subtitle">Géneros detectados en tu playlist</p>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {userStats.topGenres.length === 0 && (
                <p style={{ color: "#aaa" }}>Sin géneros detectados. Asegurate de que tus canciones tengan género asignado.</p>
              )}
              {userStats.topGenres.map(([genre, count], i) => {
                const colors = ["#1db954","#d6e109","#e70404","#be1588","#0e7187"];
                return (
                  <div key={genre} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    background: "#1a1a1a", borderRadius: "10px", padding: "12px 16px",
                    border: `1px solid ${colors[i]}33`
                  }}>
                    <span style={{
                      width: "36px", height: "36px", borderRadius: "50%",
                      background: colors[i], display: "flex", alignItems: "center",
                      justifyContent: "center", fontWeight: "bold", fontSize: "0.85rem",
                      color: "#000", flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, color: "#eee", fontWeight: "600", fontSize: "0.95rem" }}>{genre}</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>
                        {count} canción{count !== 1 ? "es" : ""}
                      </p>
                    </div>
                    <span style={{ color: colors[i], fontWeight: "bold", fontSize: "1.1rem" }}>
                      {Math.round((count / userStats.total) * 100)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

        </div>
      )}

      {/* FILA 3: Inspector de artistas (sin cambios) */}
      <div style={{ marginTop: "30px" }}>
        <section className="graph-section" style={{ margin: 0, display: "flex", flexDirection: "column" }}>
          <h2>🔍 Inspector de Datos</h2>
          <p className="graph-subtitle">Audita la metadata profunda de Deezer</p>

          <form onSubmit={(e) => {
            e.preventDefault();
            if (!searchQuery.trim()) return;
            setLoadingSearch(true);
            fetch(`/deezer/search/artist?q=${searchQuery}`)
              .then((res) => res.json())
              .then((data) => {
                if (data.data && data.data.length > 0) {
                  return fetch(`/deezer/artist/${data.data[0].id}`);
                }
                throw new Error("Artista no encontrado");
              })
              .then((res) => res.json())
              .then((artistInfo) => { setSearchResult(artistInfo); setLoadingSearch(false); })
              .catch(() => { setSearchResult({ error: true }); setLoadingSearch(false); });
          }} style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
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
              <div style={{ background: "#222", padding: "15px", borderRadius: "10px", textAlign: "center", maxWidth: "300px" }}>
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
