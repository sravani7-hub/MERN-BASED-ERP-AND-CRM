import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #16213e 100%)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(26, 26, 46, 0.8)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(108, 92, 231, 0.2)',
          borderRadius: 16,
          padding: 40,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 4,
            }}
          >
            ERP-CRM
          </h1>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>
            Enterprise Resource & Customer Management
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
