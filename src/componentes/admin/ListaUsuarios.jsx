import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./styles/ListaUsuarios.css";

const COLORS = [
  { bg: '#B5D4F4', fg: '#0C447C' },
  { bg: '#9FE1CB', fg: '#085041' },
  { bg: '#F4C0D1', fg: '#72243E' },
  { bg: '#FAC775', fg: '#633806' },
  { bg: '#CECBF6', fg: '#3C3489' },
  { bg: '#F0997B', fg: '#993C1D' },
];

function getInitials(email) {
  const name = (email ?? '??').split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/music_users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setUsuarios(data); })
      .catch(err => console.error('Error cargando usuarios:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: '#888', padding: '20px' }}>Cargando usuarios...</p>;

  return (
    <div className="lista-usuarios-container">
      <h1>Usuarios registrados</h1>
      <p className="lista-usuarios-subtitle">
        Hacé clic en un usuario para ver su actividad musical
      </p>

      <div className="usuarios-grid">
        {usuarios
          .filter(u => u.email)
          .map((u, i) => {
            const color = COLORS[i % COLORS.length];
            const esAdmin   = u.role === 'admin';
            const esPremium = u.role === 'premium';

            return (
              <div
                key={u.id}
                className={`usuario-card ${esAdmin ? 'usuario-card--admin' : ''}`}
                onClick={() => navigate(`/admin/usuarios/${u.id}`)}
              >
                <div className="usuario-card__top">
                  <div
                    className="usuario-card__avatar"
                    style={{ background: color.bg, color: color.fg }}
                  >
                    {getInitials(u.email)}
                  </div>
                  {esAdmin   && <span className="usuario-card__role-icon">🛡️</span>}
                  {esPremium && <span className="usuario-card__role-icon">👑</span>}
                </div>

                <p className="usuario-card__email">{u.email}</p>

                <div className="usuario-card__badges">
                  {esAdmin   && <span className="role-badge role-badge--admin">ADMIN</span>}
                  {esPremium && <span className="role-badge role-badge--premium">PREMIUM</span>}
                  {!esAdmin && !esPremium && <span className="role-badge role-badge--free">GRATUITO</span>}
                </div>

                <p className="usuario-card__footer">Ver estadísticas →</p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ListaUsuarios;