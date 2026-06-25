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
            
            // --- DETECCIÓN DE ROL PARA LOS ÍCONOS DE DISTINCIÓN ---
            const esAdmin = u.role === 'admin';
            const esPremium = u.role === 'premium';

            return (
              <div
                key={u.id}
                onClick={() => navigate(`/admin/usuarios/${u.id}`)}
                style={{
                  background: '#1a1a1a',
                  border: esAdmin ? '0.5px solid #FAC775' : '0.5px solid #2a2a2a', // Borde dorado sutil si es admin
                  borderRadius: '12px',
                  padding: '16px 20px',
                  cursor: 'pointer',
                  position: 'relative', // Para si después querés meter algo absoluto
                  transition: 'border-color 0.15s, transform 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = esAdmin ? '#FAC775' : '#444'}
                onMouseLeave={e => e.currentTarget.style.borderColor = esAdmin ? '#FAC775' : '#2a2a2a'}
              >
                {/* Contenedor del Avatar y la Corona/Escudo */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '50%',
                    background: color.bg, color: color.fg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '500', fontSize: '15px',
                  }}>
                    {getInitials(u.email)}
                  </div>

                  {/* 👑 Corona para Premium o 🛡️ Escudo para Admin */}
                  {esAdmin && <span style={{ fontSize: '20px', title: 'Administrador' }}>🛡️</span>}
                  {esPremium && <span style={{ fontSize: '20px', title: 'Miembro Premium' }}>👑</span>}
                </div>

                {/* Email del usuario */}
                <p style={{ 
                  fontWeight: '500', 
                  fontSize: '14px', 
                  marginBottom: '6px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis' 
                }}>
                  {u.email}
                </p>

                {/* --- ETIQUETA VISUAL DE ROL (BADGE) --- */}
                <div style={{ marginBottom: '12px' }}>
                  {esAdmin && (
                    <span style={{ background: 'rgba(250, 199, 117, 0.15)', color: '#FAC775', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      ADMIN
                    </span>
                  )}
                  {esPremium && (
                    <span style={{ background: 'rgba(181, 212, 244, 0.15)', color: '#B5D4F4', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' }}>
                      PREMIUM
                    </span>
                  )}
                  {!esAdmin && !esPremium && (
                    <span style={{ background: 'rgba(255, 255, 255, 0.08)', color: '#888', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                      GRATUITO
                    </span>
                  )}
                </div>

                
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