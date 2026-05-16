import React from 'react';

export default function AuthScreen({ loginKey, setLoginKey, loginError, isLoadingAuth, handleLogin }) {
  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '350px', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Outfit' }}>Vault Access</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Enter Passkey" 
            value={loginKey}
            onChange={e => setLoginKey(e.target.value)}
            required
            autoFocus
            style={{ textAlign: 'center', letterSpacing: '3px', fontSize: '1.2rem' }}
          />
          {loginError && <p style={{ color: 'var(--danger-color)', fontSize: '0.85rem', margin: '0' }}>Akses ditolak.</p>}
          <button type="submit" className="glass-button" style={{ width: '100%' }} disabled={isLoadingAuth}>
            {isLoadingAuth ? 'Decrypting...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  );
}
