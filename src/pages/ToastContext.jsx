import { createContext, useContext, useState } from 'react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <ToastContext.Provider value={{ mostrarToast }}>
      {children}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '32px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1e1e1e',
          border: `1px solid ${toast.tipo === 'error' ? '#ff4757' : '#1db954'}`,
          borderRadius: '12px',
          padding: '12px 20px',
          color: '#fff',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 99999,
          whiteSpace: 'nowrap',
          animation: 'fadeInUp 0.2s ease'
        }}>
          <span>{toast.tipo === 'error' ? '⚠️' : '✅'}</span>
          {toast.mensaje}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);