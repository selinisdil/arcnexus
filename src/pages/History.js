import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';

const TOKEN_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

const CONFIGS = {
  arc: {
    rpc: 'https://rpc.testnet.arc.network',
    usdc: '0x3600000000000000000000000000000000000000',
    eurc: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
    explorer: 'https://testnet.arcscan.app/tx/',
    apiBase: 'https://testnet.arcscan.app/api',
    label: 'Arc Testnet',
    maxRange: 49000,
    totalRange: 500000,
  },
  sepolia: {
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
    usdc: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    eurc: null,
    explorer: 'https://sepolia.etherscan.io/tx/',
    apiBase: null,
    label: 'ETH Sepolia',
    maxRange: 49000,
    totalRange: 150000,
  },
};

const History = ({ account }) => {
  const [txList, setTxList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [chain, setChain] = useState('arc');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  const fetchViaAPI = useCallback(async (cfg, acc) => {
    const tokens = [{ address: cfg.usdc, token: 'USDC' }];
    if (cfg.eurc) tokens.push({ address: cfg.eurc, token: 'EURC' });

    let allTx = [];
    for (const t of tokens) {
      try {
        const url = `${cfg.apiBase}?module=account&action=tokentx&contractaddress=${t.address}&address=${acc}&sort=desc&offset=50`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === '1' && Array.isArray(data.result)) {
          allTx = allTx.concat(data.result.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            amount: ethers.formatUnits(tx.value, 6),
            block: parseInt(tx.blockNumber),
            token: t.token,
            type: tx.from.toLowerCase() === acc.toLowerCase() ? 'sent' : 'received',
          })));
        }
      } catch (e) {}
    }
    return allTx.sort((a, b) => b.block - a.block).slice(0, 50);
  }, []);

  const fetchViaRPC = useCallback(async (cfg, acc) => {
    const provider = new ethers.JsonRpcProvider(cfg.rpc);
    const currentBlock = await provider.getBlockNumber();

    let allSent = [], allReceived = [], allEurc = [];
    const usdcContract = new ethers.Contract(cfg.usdc, TOKEN_ABI, provider);

    for (let end = currentBlock; end > currentBlock - cfg.totalRange; end -= cfg.maxRange) {
      const start = Math.max(0, end - cfg.maxRange);
      try {
        const [s, r] = await Promise.all([
          usdcContract.queryFilter(usdcContract.filters.Transfer(acc, null), start, end),
          usdcContract.queryFilter(usdcContract.filters.Transfer(null, acc), start, end),
        ]);
        allSent = allSent.concat(s);
        allReceived = allReceived.concat(r);

        if (cfg.eurc) {
          const eurcContract = new ethers.Contract(cfg.eurc, TOKEN_ABI, provider);
          const [es, er] = await Promise.all([
            eurcContract.queryFilter(eurcContract.filters.Transfer(acc, null), start, end),
            eurcContract.queryFilter(eurcContract.filters.Transfer(null, acc), start, end),
          ]);
          allEurc = allEurc.concat([
            ...es.map(e => ({ ...e, token: 'EURC' })),
            ...er.map(e => ({ ...e, token: 'EURC' })),
          ]);
        }

        if (allSent.length + allReceived.length + allEurc.length >= 50) break;
      } catch (e) { continue; }
    }

    const raw = [
      ...allSent.map(e => ({ ...e, token: 'USDC' })),
      ...allReceived.map(e => ({ ...e, token: 'USDC' })),
      ...allEurc,
    ].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 50);

    return raw.map(e => ({
      hash: e.transactionHash,
      from: e.args.from,
      to: e.args.to,
      amount: ethers.formatUnits(e.args.value, 6),
      block: e.blockNumber,
      token: e.token,
      type: e.args.from.toLowerCase() === acc.toLowerCase() ? 'sent' : 'received',
    }));
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    setError(null);

    const cfg = CONFIGS[chain];
    try {
      let results = [];

      if (cfg.apiBase) {
        try {
          results = await fetchViaAPI(cfg, account);
          if (results.length === 0) throw new Error('empty');
        } catch (e) {
          results = await fetchViaRPC(cfg, account);
        }
      } else {
        results = await fetchViaRPC(cfg, account);
      }

      setTxList(results);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(err);
      setError('Could not load transactions: ' + (err.shortMessage || err.message));
    }
    setLoading(false);
  }, [account, chain, fetchViaAPI, fetchViaRPC]);

  useEffect(() => {
    setTxList([]);
    fetchHistory();
    const interval = setInterval(fetchHistory, 20000);
    return () => clearInterval(interval);
  }, [fetchHistory]);

  const filtered = filter === 'all' ? txList : txList.filter(tx => tx.type === filter);
  const cfg = CONFIGS[chain];

  if (!account) return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>History</h2>
        <p style={{ color: '#888' }}>Your transaction history</p>
      </div>
      <div style={{ textAlign: 'center', padding: '60px', color: '#888', background: '#0d0d1a', borderRadius: '16px', border: '1px solid #1e1e2e' }}>
        Connect your wallet to see transactions
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>History</h2>
          <p style={{ color: '#888' }}>Your USDC and EURC transaction history</p>
        </div>
        {lastUpdated && (
          <div style={{ color: '#555', fontSize: '12px' }}>Last updated: {lastUpdated}</div>
        )}
      </div>

      {/* Chain Seçici */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {Object.entries(CONFIGS).map(([key, c]) => (
          <button key={key} onClick={() => { setChain(key); setTxList([]); setError(null); }} style={{
            padding: '8px 18px', borderRadius: '10px',
            border: '1px solid ' + (chain === key ? '#8b5cf6' : '#3d3d5c'),
            background: chain === key ? '#8b5cf622' : '#1e1e2e',
            color: chain === key ? '#8b5cf6' : '#888',
            cursor: 'pointer', fontWeight: '600', fontSize: '13px'
          }}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Filtre + Refresh */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center' }}>
        {['all', 'sent', 'received'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: '8px',
            border: '1px solid ' + (filter === f ? '#8b5cf6' : '#3d3d5c'),
            background: filter === f ? '#8b5cf622' : 'transparent',
            color: filter === f ? '#8b5cf6' : '#888',
            cursor: 'pointer', fontWeight: '600', fontSize: '12px', textTransform: 'capitalize'
          }}>
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {loading && (
            <span style={{ color: '#8b5cf6', fontSize: '12px' }}>⟳ Loading...</span>
          )}
          <button onClick={fetchHistory} disabled={loading} style={{
            padding: '6px 14px', borderRadius: '8px',
            border: '1px solid #3d3d5c', background: '#1e1e2e',
            color: loading ? '#555' : '#8b5cf6',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600', fontSize: '12px'
          }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Hata */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#2a0d0d', border: '1px solid #f8717144', borderRadius: '10px', color: '#f87171', fontSize: '12px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* İçerik */}
      {loading && txList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
          Loading transactions...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888', background: '#0d0d1a', borderRadius: '16px', border: '1px solid #1e1e2e' }}>
          No transactions found on {cfg.label}
        </div>
      ) : (
        <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', overflow: 'hidden' }}>
          {filtered.map((tx, i) => (
            <div key={i} style={{
              padding: '14px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2e' : 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: tx.type === 'sent' ? '#2a1a1a' : '#0d2a1a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', color: tx.type === 'sent' ? '#ef4444' : '#22c55e',
                  fontWeight: '700'
                }}>
                  {tx.type === 'sent' ? '↑' : '↓'}
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '2px' }}>
                    {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.token}
                  </div>
                  <div style={{ color: '#888', fontSize: '11px', marginBottom: '2px' }}>
                    {tx.type === 'sent'
                      ? 'To: ' + tx.to.slice(0, 8) + '...' + tx.to.slice(-4)
                      : 'From: ' + tx.from.slice(0, 8) + '...' + tx.from.slice(-4)}
                  </div>
                  <a href={cfg.explorer + tx.hash} target="_blank" rel="noreferrer"
                    style={{ color: '#8b5cf6', fontSize: '11px', textDecoration: 'none' }}>
                    View on Explorer ↗
                  </a>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '700', fontSize: '14px', color: tx.type === 'sent' ? '#ef4444' : '#22c55e' }}>
                  {tx.type === 'sent' ? '-' : '+'}{parseFloat(tx.amount).toFixed(4)} {tx.token}
                </div>
                <div style={{ color: '#555', fontSize: '11px' }}>Block {tx.block}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;