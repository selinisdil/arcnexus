import React, { useState } from 'react';

const Landing = ({ onEnter }) => {
  const [dark, setDark] = useState(true);

  const theme = {
    bg: dark ? '#06060f' : '#f8f8ff',
    card: dark ? '#0d0d1a' : '#ffffff',
    border: dark ? '#1e1e2e' : '#e2e2f0',
    text: dark ? '#ffffff' : '#0f0f1a',
    sub: dark ? '#888888' : '#666680',
    muted: dark ? '#555555' : '#aaaacc',
    nav: dark ? '#06060fcc' : '#f8f8ffcc',
  };

  const features = [
    { icon: '🌉', title: 'Bridge', desc: 'Cross-chain USDC transfers powered by Circle CCTP V2. Fast, secure, trustless.', color: '#6366f1' },
    { icon: '🔄', title: 'Swap', desc: 'Seamlessly swap USDC and EURC on Arc Testnet with real-time rates.', color: '#8b5cf6' },
    { icon: '🛡️', title: 'RefundPay', desc: 'On-chain escrow payments with dispute resolution. Send crypto with chargeback protection.', color: '#22c55e' },
    { icon: '📊', title: 'Dashboard', desc: 'Track your balances across Arc and Sepolia networks in one place.', color: '#f59e0b' },
    { icon: '📜', title: 'History', desc: 'Full transaction history with real-time updates via Arc API.', color: '#ef4444' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overflowX: 'hidden',
      transition: 'all 0.3s ease',
    }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '20px 48px', borderBottom: '1px solid ' + theme.border,
        position: 'sticky', top: 0, background: theme.nav,
        backdropFilter: 'blur(12px)', zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>⚡</div>
          <span style={{ fontWeight: '800', fontSize: '18px', color: theme.text }}>ArcNexus</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => setDark(!dark)} style={{
            background: theme.card, border: '1px solid ' + theme.border,
            borderRadius: '10px', padding: '8px 14px', cursor: 'pointer',
            fontSize: '18px', transition: 'all 0.2s',
          }}>
            {dark ? '☀️' : '🌙'}
          </button>
          <button onClick={() => onEnter(dark)} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', padding: '10px 24px',
            borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '14px',
          }}>
            Launch App →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        textAlign: 'center', padding: '100px 24px 80px',
        background: dark
          ? 'radial-gradient(ellipse at 50% 0%, #6366f115 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 0%, #6366f108 0%, transparent 70%)',
      }}>
        <div style={{
          display: 'inline-block', padding: '6px 16px', borderRadius: '20px',
          background: '#8b5cf622', border: '1px solid #8b5cf644',
          color: '#8b5cf6', fontSize: '13px', fontWeight: '600', marginBottom: '24px',
        }}>
          Built on Arc Testnet
        </div>

        <h1 style={{
          fontSize: '64px', fontWeight: '900', lineHeight: '1.1',
          marginBottom: '24px', letterSpacing: '-2px', color: theme.text,
        }}>
          The Complete<br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            DeFi Gateway
          </span>
        </h1>

        <p style={{
          fontSize: '20px', color: theme.sub, maxWidth: '560px',
          margin: '0 auto 48px', lineHeight: '1.6',
        }}>
          Bridge, swap, and pay with USDC and EURC across chains.
          Built with on-chain escrow and chargeback protection.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => onEnter(dark)} style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', padding: '16px 36px',
            borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '16px',
          }}>
            Launch App →
          </button>
          <a href="https://testnet.arcscan.app" target="_blank" rel="noreferrer" style={{
            background: 'transparent', color: theme.sub,
            border: '1px solid ' + theme.border, padding: '16px 36px',
            borderRadius: '12px', fontWeight: '700',
            fontSize: '16px', textDecoration: 'none',
          }}>
            Explorer ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: 'flex', justifyContent: 'center', gap: '48px',
        padding: '40px 24px',
        borderTop: '1px solid ' + theme.border,
        borderBottom: '1px solid ' + theme.border,
        flexWrap: 'wrap',
        background: theme.card,
      }}>
        {[
          { label: 'Supported Tokens', value: '2', sub: 'USDC & EURC' },
          { label: 'Networks', value: '2', sub: 'Arc + Sepolia' },
          { label: 'Escrow Contract', value: '1', sub: 'On-chain' },
          { label: 'Bridge Protocol', value: 'CCTP V2', sub: 'Circle' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#8b5cf6' }}>{s.value}</div>
            <div style={{ fontSize: '14px', color: theme.text, fontWeight: '600' }}>{s.label}</div>
            <div style={{ fontSize: '12px', color: theme.muted }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '800', marginBottom: '48px', color: theme.text }}>
          Everything you need
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {features.map((f, i) => (
            <div key={i}
              style={{
                background: theme.card, border: '1px solid ' + theme.border,
                borderRadius: '16px', padding: '28px', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '88'}
              onMouseLeave={e => e.currentTarget.style.borderColor = theme.border}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: f.color + '22', border: '1px solid ' + f.color + '44',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '16px',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: theme.text }}>{f.title}</h3>
              <p style={{ color: theme.sub, fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{
        textAlign: 'center', padding: '80px 24px',
        background: dark
          ? 'radial-gradient(ellipse at 50% 100%, #6366f115 0%, transparent 70%)'
          : 'radial-gradient(ellipse at 50% 100%, #6366f108 0%, transparent 70%)',
        borderTop: '1px solid ' + theme.border,
      }}>
        <h2 style={{ fontSize: '40px', fontWeight: '800', marginBottom: '16px', color: theme.text }}>
          Ready to get started?
        </h2>
        <p style={{ color: theme.sub, fontSize: '18px', marginBottom: '40px' }}>
          Connect your wallet and start bridging, swapping, and paying securely.
        </p>
        <button onClick={() => onEnter(dark)} style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none', padding: '18px 48px',
          borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '18px',
        }}>
          Launch ArcNexus →
        </button>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center', padding: '24px',
        borderTop: '1px solid ' + theme.border,
        color: theme.muted, fontSize: '13px',
        background: theme.card,
      }}>
        ArcNexus • Built on Arc Testnet
      </div>
    </div>
  );
};

export default Landing;