import { useState, useEffect } from "react";
import { Doughnut, Bar } from "react-chartjs-2";
import {Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement,} from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

function Admin() {
  const [genres, setGenres] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [rolesStats, setRolesStats] = useState({ total: 0, admins: 0, premium: 0, users: 0 });

  // EFFECT 1: Géneros globales de Deezer
  useEffect(() => {
    
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

  // EFFECT 2: Estadísticas globales — todos los usuarios + favoritos + playlists
  useEffect(() => {
    
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${import.meta.env.VITE_API_URL}/music_users`, { headers })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(usuarios => {
        if (!Array.isArray(usuarios) || usuarios.length === 0) {
          setUserStats(null);
          setLoadingStats(false);
          return;
        }

        // Conteo por rol
        const admins  = usuarios.filter(u => u.role === 'admin').length;
        const premium = usuarios.filter(u => u.role === 'premium').length;
        const users   = usuarios.filter(u => u.role === 'user').length;
        setRolesStats({ total: usuarios.length, admins, premium, users });

        const fetches = usuarios.map(u =>
          Promise.all([
            fetch(`${import.meta.env.VITE_API_URL}/favorites?id_user=${u.id}`, { headers })
              .then(res => res.ok ? res.json() : [])
              .then(favs => Array.isArray(favs) ? favs : [])
              .catch(() => []),
            fetch(`${import.meta.env.VITE_API_URL}/music_users/${u.id}/projection`, { headers })
              .then(res => res.ok ? res.json() : {})
              .catch(() => ({})),
          ]).then(([favs, proy]) => {
            const seenIds = new Set(favs.map(c => c.id).filter(Boolean));
            const playlistSongs = (proy?.playlists ?? []).flatMap(pl => pl.canciones ?? []);
            const extras = playlistSongs.filter(c => {
              if (c.id && seenIds.has(c.id)) return false;
              if (c.id) seenIds.add(c.id);
              return true;
            });
            return [...favs, ...extras];
          })
        );

        return Promise.all(fetches);
      })
      .then(todasLasCanciones => {
        if (!todasLasCanciones) return;

        const todas = todasLasCanciones.flat();
        const artistCount = {};
        const albumCount  = {};
        const genreCount  = {};

        todas.forEach(c => {
          if (c.artist) artistCount[c.artist] = (artistCount[c.artist] || 0) + 1;
          if (c.album)  albumCount[c.album]   = (albumCount[c.album]   || 0) + 1;
          if (c.genre && c.genre !== 'Unknown')
            genreCount[c.genre] = (genreCount[c.genre] || 0) + 1;
        });

        const sortTop = (obj, n = 5) =>
          Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

        setUserStats({
          total:      todas.length,
          topArtists: sortTop(artistCount, 5),
          topAlbums:  sortTop(albumCount,  5),
          topGenres:  sortTop(genreCount,  5),
        });
        setLoadingStats(false);
      })
      .catch(err => {
        console.error('Error trayendo estadísticas globales:', err);
        setLoadingStats(false);
      });
  }, []);

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
      </header>

      {/* TARJETAS RÁPIDAS */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">📊</span>
          <div>
            <h3>Categorías Activas</h3>
            <p className="stat-number">{genres.length} Géneros</p>
          </div>
        </div>

        {/* CARD USUARIOS TOTALES */}
        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <h3>Usuarios Registrados</h3>
            <p className="stat-number">
              {loadingStats ? '...' : `${rolesStats.total} usuarios`}
            </p>
          </div>
        </div>

        {/* CARD BREAKDOWN DE ROLES */}
        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="stat-icon">🎭</span>
            <h3 style={{ margin: 0 }}>Roles</h3>
          </div>
          {loadingStats ? (
            <p className="stat-number">...</p>
          ) : (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.82rem', background: '#1a1a1a', borderRadius: '20px', padding: '4px 10px', border: '1px solid #e70404', color: '#e70404', fontWeight: 600 }}>
                👑 {rolesStats.admins} admin{rolesStats.admins !== 1 ? 's' : ''}
              </span>
              <span style={{ fontSize: '0.82rem', background: '#1a1a1a', borderRadius: '20px', padding: '4px 10px', border: '1px solid #d6e109', color: '#d6e109', fontWeight: 600 }}>
                ⭐ {rolesStats.premium} premium
              </span>
              <span style={{ fontSize: '0.82rem', background: '#1a1a1a', borderRadius: '20px', padding: '4px 10px', border: '1px solid #555', color: '#aaa', fontWeight: 600 }}>
                🎵 {rolesStats.users} gratis
              </span>
            </div>
          )}
        </div>

        <div className="stat-card">
          <span className="stat-icon">❤️</span>
          <div>
            <h3>Total Canciones (incl. Playlists)</h3>
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

        <section className="graph-section" style={{ margin: 0, display: "flex", flexDirection: "column", minHeight: "450px" }}>
          <h2>🎤 Artistas Más Guardados</h2>
          <p className="graph-subtitle">Top global de todos los usuarios</p>
          {loadingStats ? (
            <div className="loader" style={{ margin: "auto" }}>Analizando la plataforma...</div>
          ) : barData ? (
            <div style={{ flex: 1, position: "relative", marginTop: "20px" }}>
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <p style={{ color: "#aaa", marginTop: "20px" }}>No hay datos todavía.</p>
          )}
        </section>

      </div>

      {/* FILA 2: Rankings de álbumes y géneros globales */}
      {!loadingStats && userStats && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginTop: "30px" }}>

          <section className="graph-section" style={{ margin: 0 }}>
            <h2>💿 Álbumes Más Guardados</h2>
            <p className="graph-subtitle">Top global de todos los usuarios</p>
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

          <section className="graph-section" style={{ margin: 0 }}>
            <h2>🎸 Géneros Más Populares</h2>
            <p className="graph-subtitle">Top global de todos los usuarios</p>
            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {userStats.topGenres.length === 0 && (
                <p style={{ color: "#aaa" }}>Sin géneros detectados.</p>
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
    </div>
  );
}

export default Admin;