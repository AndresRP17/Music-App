import { useState, useEffect } from "react";
import { Doughnut, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
} from "chart.js";
import "./styles/Admin.css";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);

// ⭐ Formateador de plata, en USD porque así están cargados los precios de los planes ⭐
const formatMoney = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n || 0);

const PLAN_LABELS = {
  premium: "Premium",
  familiar: "Familiar",
};

const PLAN_COLORS = {
  premium: "#d0b412",
  familiar: "#10B981",
};

function Admin() {
  const [genres, setGenres] = useState([]);
  const [loadingChart, setLoadingChart] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [rolesStats, setRolesStats] = useState({ total: 0, admins: 0, premium: 0, users: 0 });

  // ⭐ NUEVO: pagos de toda la plataforma, para los gráficos de ingresos ⭐
  const [pagos, setPagos] = useState([]);
  const [loadingPagos, setLoadingPagos] = useState(true);

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

  // ⭐ EFFECT 3 (NUEVO): Pagos de toda la plataforma, para los gráficos de plata ⭐
  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    fetch(`${import.meta.env.VITE_API_URL}/pagos`, { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setPagos(Array.isArray(data) ? data : []))
      .catch(err => {
        console.error('Error trayendo pagos:', err);
        setPagos([]);
      })
      .finally(() => setLoadingPagos(false));
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
  const GENRE_COLORS = ["#1db954","#d6e109","#e70404","#be1588","#0e7187"];

  // ⭐⭐⭐ NUEVO: cálculos de plata a partir de "pagos" ⭐⭐⭐
  // ⭐ OJO: en la tabla "pagos" el estado guardado es "exitoso", no "completado" ⭐
  const pagosCompletados = pagos.filter(p => p.estado === 'exitoso');
  const ingresosTotales = pagosCompletados.reduce((acc, p) => acc + Number(p.monto || 0), 0);

  // Agrupar ingresos por mes (clave ordenable "YYYY-MM")
  const ingresosPorMesMap = {};
  pagosCompletados.forEach(p => {
    const fecha = new Date(p.fecha);
    if (isNaN(fecha.getTime())) return;
    const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    ingresosPorMesMap[key] = (ingresosPorMesMap[key] || 0) + Number(p.monto || 0);
  });
  const mesesOrdenados = Object.keys(ingresosPorMesMap).sort();
  const labelsMeses = mesesOrdenados.map((key) => {
    const [y, m] = key.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  });
  const valoresMeses = mesesOrdenados.map((key) => ingresosPorMesMap[key]);

  const dataIngresosMes = {
    labels: labelsMeses,
    datasets: [{
      label: "Ingresos (USD)",
      data: valoresMeses,
      backgroundColor: "#1db95433",
      borderColor: "#1db954",
      borderWidth: 2,
      fill: true,
      tension: 0.35,
      pointBackgroundColor: "#1db954",
      pointBorderColor: "#121212",
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#181818", titleColor: "#1db954", bodyColor: "#fff",
        borderColor: "#282828", borderWidth: 1,
        callbacks: { label: (ctx) => ` ${formatMoney(ctx.raw)}` }
      },
    },
    scales: {
      x: { ticks: { color: "#aaa", font: { size: 11 } }, grid: { color: "#222" } },
      y: {
        ticks: { color: "#aaa", callback: (v) => formatMoney(v) },
        grid: { color: "#222" },
        beginAtZero: true,
      },
    },
  };

  // Ingresos agrupados por plan (Premium vs Familiar)
  const ingresosPorPlanMap = {};
  pagosCompletados.forEach(p => {
    const plan = p.plan || 'otro';
    ingresosPorPlanMap[plan] = (ingresosPorPlanMap[plan] || 0) + Number(p.monto || 0);
  });
  const planesOrdenados = Object.keys(ingresosPorPlanMap);

  const dataIngresosPorPlan = {
    labels: planesOrdenados.map((p) => PLAN_LABELS[p] || p),
    datasets: [{
      data: planesOrdenados.map((p) => ingresosPorPlanMap[p]),
      backgroundColor: planesOrdenados.map((p) => (PLAN_COLORS[p] || "#0e7187") + "cc"),
      borderColor: "#121212",
      borderWidth: 2,
    }],
  };

  const donaPlanOptions = {
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
        callbacks: { label: (ctx) => ` ${ctx.label}: ${formatMoney(ctx.raw)}` }
      },
    },
    cutout: "70%",
  };

  // Últimas 5 transacciones, para una lista rápida
  const ultimosPagos = [...pagosCompletados]
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

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

        <div className="stat-card">
          <span className="stat-icon">👥</span>
          <div>
            <h3>Usuarios Registrados</h3>
            <p className="stat-number">
              {loadingStats ? '...' : `${rolesStats.total} usuarios`}
            </p>
          </div>
        </div>

        <div className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="stat-icon">🎭</span>
            <h3 style={{ margin: 0 }}>Roles</h3>
          </div>
          {loadingStats ? (
            <p className="stat-number">...</p>
          ) : (
            <div className="roles-badges">
              <span className="role-badge role-badge--admin">
                👑 {rolesStats.admins} admin{rolesStats.admins !== 1 ? 's' : ''}
              </span>
              <span className="role-badge role-badge--premium">
                ⭐ {rolesStats.premium} premium
              </span>
              <span className="role-badge role-badge--free">
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

      {/* ⭐ NUEVO: TARJETAS DE PLATA ⭐ */}
      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">💰</span>
          <div>
            <h3>Ingresos Totales</h3>
            <p className="stat-number">{loadingPagos ? "..." : formatMoney(ingresosTotales)}</p>
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-icon">🧾</span>
          <div>
            <h3>Pagos Confirmados</h3>
            <p className="stat-number">{loadingPagos ? "..." : `${pagosCompletados.length} pagos`}</p>
          </div>
        </div>
      </section>

      {/* FILA 1: Dona global + Barras de artistas */}
      <div className="admin-charts-row">

        <section className="graph-section">
          <h2>🎵 Cuota de Mercado por Género</h2>
          <p className="graph-subtitle">Porcentaje estimado de reproducciones en la plataforma</p>
          {loadingChart ? (
            <div className="loader">Mapeando base de datos de géneros...</div>
          ) : (
            <div className="graph-chart-wrapper">
              <Doughnut data={dataForChart} options={chartOptions} />
            </div>
          )}
        </section>

        <section className="graph-section">
          <h2>🎤 Artistas Más Guardados</h2>
          <p className="graph-subtitle">Top global de todos los usuarios</p>
          {loadingStats ? (
            <div className="loader">Analizando la plataforma...</div>
          ) : barData ? (
            <div className="graph-chart-wrapper">
              <Bar data={barData} options={barOptions} />
            </div>
          ) : (
            <p style={{ color: "#aaa", marginTop: "20px" }}>No hay datos todavía.</p>
          )}
        </section>

      </div>

      {/* FILA 2: Rankings de álbumes y géneros globales */}
      {!loadingStats && userStats && (
        <div className="admin-rankings-row">

          <section className="graph-section">
            <h2>💿 Álbumes Más Guardados</h2>
            <p className="graph-subtitle">Top global de todos los usuarios</p>
            <div className="ranking-list">
              {userStats.topAlbums.length === 0 && <p className="detalle-card__empty">Sin datos.</p>}
              {userStats.topAlbums.map(([album, count], i) => {
                const pct = Math.round((count / userStats.total) * 100);
                return (
                  <div key={album}>
                    <div className="ranking-item__header">
                      <span className="ranking-item__name">{MEDAL[i]} {album}</span>
                      <span className="ranking-item__count">{count} canción{count !== 1 ? "es" : ""}</span>
                    </div>
                    <div className="ranking-item__bar-track">
                      <div className="ranking-item__bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="graph-section">
            <h2>🎸 Géneros Más Populares</h2>
            <p className="graph-subtitle">Top global de todos los usuarios</p>
            <div className="genres-list">
              {userStats.topGenres.length === 0 && (
                <p className="detalle-card__empty">Sin géneros detectados.</p>
              )}
              {userStats.topGenres.map(([genre, count], i) => (
                <div
                  key={genre}
                  className="genre-item"
                  style={{ border: `1px solid ${GENRE_COLORS[i]}33` }}
                >
                  <span
                    className="genre-item__number"
                    style={{ background: GENRE_COLORS[i] }}
                  >
                    {i + 1}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p className="genre-item__name">{genre}</p>
                    <p className="genre-item__count">{count} canción{count !== 1 ? "es" : ""}</p>
                  </div>
                  <span className="genre-item__pct" style={{ color: GENRE_COLORS[i] }}>
                    {Math.round((count / userStats.total) * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </section>

        </div>
      )}

      {/* ⭐⭐⭐ FILA 3 (NUEVA): Plata — ingresos por mes + por plan ⭐⭐⭐ */}
      <div className="admin-charts-row">

        <section className="graph-section">
          <h2>💵 Ingresos por Mes</h2>
          <p className="graph-subtitle">Evolución de la facturación confirmada</p>
          {loadingPagos ? (
            <div className="loader">Sumando los pagos...</div>
          ) : valoresMeses.length > 0 ? (
            <div className="graph-chart-wrapper">
              <Line data={dataIngresosMes} options={lineOptions} />
            </div>
          ) : (
            <p style={{ color: "#aaa", marginTop: "20px" }}>Todavía no hay pagos registrados.</p>
          )}
        </section>

        <section className="graph-section">
          <h2>👑 Ingresos por Plan</h2>
          <p className="graph-subtitle">Premium vs Familiar</p>
          {loadingPagos ? (
            <div className="loader">Sumando los pagos...</div>
          ) : planesOrdenados.length > 0 ? (
            <div className="graph-chart-wrapper">
              <Doughnut data={dataIngresosPorPlan} options={donaPlanOptions} />
            </div>
          ) : (
            <p style={{ color: "#aaa", marginTop: "20px" }}>Todavía no hay pagos registrados.</p>
          )}
        </section>

      </div>

      {/* ⭐ NUEVO: últimas transacciones ⭐ */}
      {!loadingPagos && ultimosPagos.length > 0 && (
        <section className="graph-section" style={{ marginTop: "20px" }}>
          <h2>🧾 Últimas Transacciones</h2>
          <p className="graph-subtitle">Los 5 pagos más recientes de la plataforma</p>
          <div className="ranking-list">
            {ultimosPagos.map((p) => (
              <div key={p.id}>
                <div className="ranking-item__header">
                  <span className="ranking-item__name">
                    {p.plan === 'familiar' ? '👨‍👩‍👧‍👦' : '👑'} {PLAN_LABELS[p.plan] || p.plan} · {p.periodo}
                  </span>
                  <span className="ranking-item__count">{formatMoney(p.monto)}</span>
                </div>
                <p style={{ color: "#777", fontSize: "12px", margin: "4px 0 12px" }}>
                  {new Date(p.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  {" · "}{p.marca} •••• {p.ultimos}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default Admin;