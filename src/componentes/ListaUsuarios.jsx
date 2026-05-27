import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ padding: '24px', color: 'white' }}>
      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '6px' }}>Usuarios registrados</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>
        Hacé clic en un usuario para ver su actividad musical
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
        gap: '12px',
      }}>
        {usuarios
          .filter(u => u.email)
          .map((u, i) => {
            const color = COLORS[i % COLORS.length];
            return (
              <div
                key={u.id}
                onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                style={{
                  background: '#1a1a1a',
                  border: '0.5px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#444'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '50%',
                  background: color.bg, color: color.fg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '500', fontSize: '15px', marginBottom: '10px',
                }}>
                  {getInitials(u.email)}
                </div>
                <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>
                  {u.email}
                </p>
                <p style={{ color: '#888', fontSize: '12px' }}>
                  {u.total_songs ?? '—'} canciones guardadas
                </p>
                <p style={{ color: '#555', fontSize: '11px', marginTop: '8px', textAlign: 'right' }}>
                  Ver estadísticas →
                </p>
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default ListaUsuarios;