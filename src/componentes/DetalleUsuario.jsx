import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';

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

  // CARGA INICIAL
  useEffect(() => {
    setLoading(true);
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
          role: usuario.role, // ✨ GUARDAMOS EL ROL DEL USUARIO ACÁ
          canciones: Array.isArray(canciones) ? canciones : [],
        });
        setUserProjection(proy);
      })
      .catch(err => console.error("Error cargando los datos del usuario:", err))
      .finally(() => setLoading(false));
  }, [id]);

  // CONTROL DEL GRÁFICO
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

  if (loading) return <p style={{ color: '#888', padding: '24px' }}>Cargando datos del usuario...</p>;
  if (!stats)  return <p style={{ color: '#f55', padding: '24px' }}>No se pudo cargar la información.</p>;

  const { topArtists, topGenres } = calcStats(stats.canciones || []);
  const total = stats.canciones?.length ?? 0;

  // Variables auxiliares para los condicionales
  const esAdmin = stats.role === 'admin';
  const esPremium = stats.role === 'premium';

  return (
    <div style={{ padding: '24px', color: 'white' }}>

      <button
        onClick={() => navigate('/admin/usuarios')}
        style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '14px', marginBottom: '20px', padding: 0 }}
      >
        ← Volver a usuarios
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: esAdmin ? '#FAC775' : '#B5D4F4', // Cambia el fondo del avatar si es admin
          color: esAdmin ? '#633806' : '#0C447C',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '500', fontSize: '18px',
        }}>
          {getInitials(stats.email)}
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {stats.email ?? 'Usuario'}
            {/* 👑 Corona / 🛡️ Escudo al lado del mail */}
            {esAdmin && <span style={{ fontSize: '18px' }}>🛡️</span>}
            {esPremium && <span style={{ fontSize: '18px' }}>👑</span>}
          </h1>
          
          {/* Badge del tipo de cuenta justo abajo del mail */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', marginBottom: '4px' }}>
            {esAdmin && (
              <span style={{ background: 'rgba(250, 199, 117, 0.15)', color: '#FAC775', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                ADMINISTRADOR
              </span>
            )}
            {esPremium && (
              <span style={{ background: 'rgba(181, 212, 244, 0.15)', color: '#B5D4F4', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                MIEMBRO PREMIUM
              </span>
            )}
            {!esAdmin && !esPremium && (
              <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#888', padding: '1px 6px', borderRadius: '4px', fontSize: '11px' }}>
                CUENTA GRATUITA
              </span>
            )}
            <span style={{ color: '#666', fontSize: '13px' }}>•</span>
            <p style={{ color: '#888', fontSize: '13px', margin: 0 }}>{total} canciones guardadas</p>
          </div>
        </div>
      </div>

      {/* Grid artistas + géneros */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Top artistas
          </h2>
          {topArtists.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px' }}>Sin datos.</p>
          ) : (
            topArtists.map(([artist, count], i) => (
              <div key={artist} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 0', borderBottom: i < topArtists.length - 1 ? '0.5px solid #2a2a2a' : 'none' }}>
                <span style={{ fontSize: '11px', color: '#555', width: '18px' }}>{MEDAL[i]}</span>
                <span style={{ flex: 1, fontSize: '14px' }}>{artist}</span>
                <span style={{ fontSize: '12px', color: '#888', background: '#222', padding: '2px 10px', borderRadius: '99px' }}>
                  {count}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Géneros favoritos
          </h2>
          {topGenres.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px' }}>Sin géneros detectados.</p>
          ) : (
            <>
              <div style={{ position: 'relative', height: '180px', marginBottom: '12px' }}>
                <canvas ref={chartRef} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {topGenres.map(([genre, count], i) => (
                  <span key={genre} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#aaa' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: GENRE_COLORS[i], display: 'inline-block' }} />
                    {genre} {Math.round((count / total) * 100)}%
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* SECCIÓN: Playlists del usuario */}
      <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Playlists de este Usuario
        </h2>
        
        {!userProjection || userProjection.error || !userProjection.playlists || userProjection.playlists.length === 0 ? (
          <p style={{ color: '#555', fontSize: '13px' }}>Este usuario no posee playlists creadas o no se pudieron cargar desde el servidor.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userProjection.playlists.map(pl => (
              <div key={pl.id} style={{ background: '#222', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '14px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#378ADD', fontSize: '14px', fontWeight: '500' }}>
                  📂 {pl.name} <span style={{ color: '#666', fontSize: '12px' }}>({pl.canciones?.length ?? 0} canciones)</span>
                </h4>
                
                {!pl.canciones || pl.canciones.length === 0 ? (
                  <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>Lista vacía.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {pl.canciones.map((c, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #2d2d2d', fontSize: '13px' }}>
                        <span style={{ color: '#eee' }}>{c.title || "Sin título"}</span>
                        <span style={{ color: '#aaa' }}>{c.artist || "Artista desconocido"}</span>
                        <span style={{ color: '#555' }}>{c.genre || "Gen."}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabla canciones guardadas (Favoritos) */}
      <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '500', color: '#888', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Canciones guardadas (Favoritos)
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ color: '#555', borderBottom: '0.5px solid #2a2a2a' }}>
              <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: '500' }}>Título</th>
              <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: '500' }}>Artista</th>
              <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: '500' }}>Álbum</th>
              <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: '500' }}>Género</th>
              <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: '500' }}>Duración</th>
            </tr>
          </thead>
          <tbody>
            {stats.canciones?.length > 0 ? (
              stats.canciones.map(c => (
                <tr key={c.id} style={{ borderBottom: '0.5px solid #1f1f1f' }}>
                  <td style={{ padding: '10px 0', color: '#eee' }}>{c.title}</td>
                  <td style={{ padding: '10px 0', color: '#aaa' }}>{c.artist}</td>
                  <td style={{ padding: '10px 0', color: '#aaa' }}>{c.album}</td>
                  <td style={{ padding: '10px 0', color: '#aaa' }}>{c.genre}</td>
                  <td style={{ padding: '10px 0', color: '#666', textAlign: 'right' }}>{c.duration}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px 0', textAlign: 'center', color: '#555' }}>
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