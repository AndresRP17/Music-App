import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import "./styles/DetalleUsuario.css";

Chart.register(ArcElement, Tooltip, Legend);

const GENRE_COLORS = ['#378ADD', '#1D9E75', '#7F77DD', '#BA7517', '#D85A30'];
const MEDAL = ['1°', '2°', '3°', '4°', '5°'];

function calcStats(canciones) {
  const artistCount = {};
  const genreCount = {};

  canciones.forEach(c => {
    if (c.artist) artistCount[c.artist] = (artistCount[c.artist] || 0) + 1;
    if (c.genre && c.genre !== 'Unknown')
      genreCount[c.genre] = (genreCount[c.genre] || 0) + 1;
  });

  const sortTop = (obj, n = 5) =>
    Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, n);

  return {
    topArtists: sortTop(artistCount, 5),
    topGenres:  sortTop(genreCount, 5),
  };
}

function getInitials(email) {
  const name = (email ?? '??').split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function DetalleUsuario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [userProjection, setUserProjection] = useState(null);
  const [loading, setLoading] = useState(true);

  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${import.meta.env.VITE_API_URL}/music_users/${id}`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/favorites?id_user=${id}`, { headers }).then(res => res.json()),
      fetch(`${import.meta.env.VITE_API_URL}/music_users/${id}/projection`, { headers })
        .then(res => res.ok ? res.json() : { error: true })
        .catch(() => ({ error: true }))
    ])
      .then(([usuario, canciones, proy]) => {
        setStats({
          email: usuario.email,
          role: usuario.role,
          canciones: Array.isArray(canciones) ? canciones : [],
        });
        setUserProjection(proy);
      })
      .catch(err => console.error("Error cargando los datos del usuario:", err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!stats?.canciones || !chartRef.current) return;

    const { topGenres } = calcStats(stats.canciones);
    if (topGenres.length === 0) return;

    if (chartInstance.current) chartInstance.current.destroy();

    chartInstance.current = new Chart(chartRef.current, {
      type: 'doughnut',
      data: {
        labels: topGenres.map(([g]) => g),
        datasets: [{
          data: topGenres.map(([, c]) => c),
          backgroundColor: GENRE_COLORS.slice(0, topGenres.length),
          borderWidth: 0,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#181818',
            titleColor: '#fff',
            bodyColor: '#aaa',
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} canción${ctx.raw !== 1 ? 'es' : ''}`,
            },
          },
        },
      },
    });

    return () => chartInstance.current?.destroy();
  }, [stats]);

  if (loading) return <p className="detalle-loading">Cargando datos del usuario...</p>;
  if (!stats)  return <p className="detalle-error">No se pudo cargar la información.</p>;

  const { topArtists, topGenres } = calcStats(stats.canciones || []);
  const total = stats.canciones?.length ?? 0;

  const esAdmin   = stats.role === 'admin';
  const esPremium = stats.role === 'premium';

  return (
    <div className="detalle-usuario-container">

      <button className="detalle-usuario__back-btn" onClick={() => navigate('/admin/usuarios')}>
        ← Volver a usuarios
      </button>

      {/* HEADER */}
      <div className="detalle-usuario__header">
        <div className={`detalle-usuario__avatar ${esAdmin ? 'detalle-usuario__avatar--admin' : 'detalle-usuario__avatar--default'}`}>
          {getInitials(stats.email)}
        </div>
        <div>
          <h1 className="detalle-usuario__email-row">
            {stats.email ?? 'Usuario'}
            {esAdmin   && <span className="detalle-usuario__role-icon">🛡️</span>}
            {esPremium && <span className="detalle-usuario__role-icon">👑</span>}
          </h1>

          <div className="detalle-usuario__meta">
            {esAdmin   && <span className="role-badge role-badge--admin">ADMINISTRADOR</span>}
            {esPremium && <span className="role-badge role-badge--premium">MIEMBRO PREMIUM</span>}
            {!esAdmin && !esPremium && <span className="role-badge role-badge--free">CUENTA GRATUITA</span>}
            <span className="detalle-usuario__separator">•</span>
            <p className="detalle-usuario__total">{total} canciones guardadas</p>
          </div>
        </div>
      </div>

      {/* GRID ARTISTAS + GÉNEROS */}
      <div className="detalle-usuario__stats-grid">

        <div className="detalle-card">
          <h2 className="detalle-card__title">Top artistas</h2>
          {topArtists.length === 0 ? (
            <p className="detalle-card__empty">Sin datos.</p>
          ) : (
            topArtists.map(([artist, count], i) => (
              <div key={artist} className="artist-row">
                <span className="artist-row__medal">{MEDAL[i]}</span>
                <span className="artist-row__name">{artist}</span>
                <span className="artist-row__count">{count}</span>
              </div>
            ))
          )}
        </div>

        <div className="detalle-card">
          <h2 className="detalle-card__title">Géneros favoritos</h2>
          {topGenres.length === 0 ? (
            <p className="detalle-card__empty">Sin géneros detectados.</p>
          ) : (
            <>
              <div className="genre-chart-wrapper">
                <canvas ref={chartRef} />
              </div>
              <div className="genre-legend">
                {topGenres.map(([genre, count], i) => (
                  <span key={genre} className="genre-legend__item">
                    <span className="genre-legend__dot" style={{ background: GENRE_COLORS[i] }} />
                    {genre} {Math.round((count / total) * 100)}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* PLAYLISTS */}
      <div className="detalle-card detalle-card--mt">
        <h2 className="detalle-card__title">Playlists de este Usuario</h2>

        {!userProjection || userProjection.error || !userProjection.playlists || userProjection.playlists.length === 0 ? (
          <p className="detalle-card__empty">
            Este usuario no posee playlists creadas o no se pudieron cargar desde el servidor.
          </p>
        ) : (
          <div className="playlists-list">
            {userProjection.playlists.map(pl => (
              <div key={pl.id} className="playlist-item">
                <h4 className="playlist-item__title">
                  📂 {pl.name} <span className="playlist-item__count">({pl.canciones?.length ?? 0} canciones)</span>
                </h4>

                {!pl.canciones || pl.canciones.length === 0 ? (
                  <p className="detalle-card__empty">Lista vacía.</p>
                ) : (
                  <div className="playlist-songs">
                    {pl.canciones.map((c, i) => (
                      <div key={i} className="playlist-song-row">
                        <span className="playlist-song-row__title">{c.title || "Sin título"}</span>
                        <span className="playlist-song-row__artist">{c.artist || "Artista desconocido"}</span>
                        <span className="playlist-song-row__genre">{c.genre || "Gen."}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAVORITOS */}
      <div className="detalle-card detalle-card--mt">
        <h2 className="detalle-card__title">Canciones guardadas (Favoritos)</h2>
        <table className="favorites-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
              <th>Género</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {stats.canciones?.length > 0 ? (
              stats.canciones.map(c => (
                <tr key={c.id}>
                  <td>{c.title}</td>
                  <td>{c.artist}</td>
                  <td>{c.album}</td>
                  <td>{c.genre}</td>
                  <td>{c.duration}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="favorites-table__empty">
                  Este usuario no guardó ninguna canción todavía.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default DetalleUsuario;
