import React from 'react';

const Navbar = ({ account, connectWallet, disconnectWallet, activePage, setActivePage }) => {
  const pages = [
    { id: 'dashboard', label: 'Dashboard', icon: '◈' },
    { id: 'bridge', label: 'Bridge', icon: '⇄' },
    { id: 'send', label: 'Send', icon: '↗' },
    { id: 'swap', label: 'Swap', icon: '↺' },
    { id: 'refundpay', label: 'Refund Pay', icon: '⟳' },
    { id: 'history', label: 'History', icon: '◷' },
  ];

  return (
    <header style={{
      padding: '0 24px',
      borderBottom: '1px solid #1e1e2e',
      background: '#0d0d1a',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <h1 style={{
        fontSize: '22px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        minWidth: '120px',
      }}>
        ArcNexus
      </h1>

      <nav style={{ display: 'flex', gap: '4px' }}>
        {pages.map(page => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            style={{
              background: activePage === page.id ? '#1e1e2e' : 'transparent',
              color: activePage === page.id ? '#8b5cf6' : '#888',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>{page.icon}</span>
            {page.label}
          </button>
        ))}
      </nav>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {account && (
          <button onClick={disconnectWallet} style={{
            background: 'transparent',
            color: '#555',
            border: '1px solid #2a2a3a',
            padding: '8px 12px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
          }}>
            Disconnect
          </button>
        )}
        <button onClick={connectWallet} style={{
          background: account ? '#1e1e2e' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          border: account ? '1px solid #3d3d5c' : 'none',
          padding: '8px 18px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          minWidth: '140px',
        }}>
          {account
            ? `${account.slice(0, 6)}...${account.slice(-4)}`
            : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

export default Navbar;