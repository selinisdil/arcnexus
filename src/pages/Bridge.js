import React, { useState } from 'react';
import { BridgeKit } from '@circle-fin/bridge-kit';
import { createAdapterFromProvider } from '@circle-fin/adapter-viem-v2';

const CHAIN_LABELS = {
  Arc_Testnet: 'Arc Testnet',
  Ethereum_Sepolia: 'ETH Sepolia',
};

const CHAIN_IDS = {
  Arc_Testnet: 5042002,
  Ethereum_Sepolia: 11155111,
};

const CHAIN_RPC = {
  Arc_Testnet: 'https://rpc.testnet.arc.network',
  Ethereum_Sepolia: 'https://ethereum-sepolia-rpc.publicnode.com',
};

const CHAIN_EXPLORER = {
  Arc_Testnet: 'https://testnet.arcscan.app',
  Ethereum_Sepolia: 'https://sepolia.etherscan.io',
};

const CHAIN_NATIVE = {
  Arc_Testnet: { name: 'Arc', symbol: 'Arc', decimals: 18 },
  Ethereum_Sepolia: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
};

const switchNetwork = async (chainKey) => {
  const chainId = CHAIN_IDS[chainKey];
  const chainIdHex = '0x' + chainId.toString(16);
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (err) {
    if (err.code === 4902 || err.code === -32603) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chainIdHex,
          chainName: CHAIN_LABELS[chainKey],
          rpcUrls: [CHAIN_RPC[chainKey]],
          blockExplorerUrls: [CHAIN_EXPLORER[chainKey]],
          nativeCurrency: CHAIN_NATIVE[chainKey],
        }],
      });
      await new Promise(r => setTimeout(r, 1000));
    } else throw err;
  }
  await new Promise(r => setTimeout(r, 800));
};

const Bridge = ({ account }) => {
  const [amount, setAmount] = useState('');
  const [fromChain, setFromChain] = useState('Arc_Testnet');
  const [toChain, setToChain] = useState('Ethereum_Sepolia');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [stepMsg, setStepMsg] = useState('');

  const toggle = () => {
    setFromChain(toChain);
    setToChain(fromChain);
    setStatus(null);
    setTxHash(null);
    setStepMsg('');
  };

  const bridgeUSDC = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setStatus(null);
    setTxHash(null);
    setStepMsg('');

    try {
      // 1. Switch to source network
      setStepMsg('Switching to ' + CHAIN_LABELS[fromChain] + '...');
      await switchNetwork(fromChain);

      // 2. Build adapter from MetaMask provider
      setStepMsg('Connecting wallet...');
      const adapter = await createAdapterFromProvider({
        provider: window.ethereum,
      });

      // 3. Build Bridge Kit & listen events
      const kit = new BridgeKit();

      kit.on('approve', (e) => {
        setStepMsg('Approving USDC...');
        if (e?.values?.txHash) setTxHash(e.values.txHash);
      });
      kit.on('burn', (e) => {
        setStepMsg('Burning USDC on ' + CHAIN_LABELS[fromChain] + '...');
        if (e?.values?.txHash) setTxHash(e.values.txHash);
      });
      kit.on('fetchAttestation', () => {
        setStepMsg('Getting Circle attestation...');
      });
      kit.on('mint', (e) => {
        setStepMsg('Minting USDC on ' + CHAIN_LABELS[toChain] + '...');
      });

      // 4. Bridge!
      setStepMsg('Starting bridge... Confirm in MetaMask.');
      await kit.bridge({
        from: { adapter, chain: fromChain },
        to: { adapter, chain: toChain },
        amount: amount,
      });

      setStepMsg('');
      setStatus('success');
      setAmount('');
    } catch (err) {
      console.error(err);
      if (err.code === 4001 || err.message?.includes('rejected') || err.message?.includes('denied')) {
        setStatus('Transaction rejected by user.');
      } else {
        setStatus('Error: ' + (err.shortMessage || err.message || String(err)));
      }
      setStepMsg('');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', background: '#1e1e2e', border: '1px solid #3d3d5c',
    borderRadius: '10px', padding: '12px 16px', color: '#fff',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Bridge</h2>
        <p style={{ color: '#888' }}>Bridge USDC between Ethereum Sepolia and Arc Testnet via CCTP V2</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '32px', maxWidth: '480px', flex: 1 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px', background: '#1e1e2e', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#6366f1', fontWeight: '700', fontSize: '14px' }}>{CHAIN_LABELS[fromChain]}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>From</div>
            </div>
            <button onClick={toggle} style={{ background: '#8b5cf622', border: '1px solid #8b5cf6', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: '#8b5cf6', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>⇄</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '14px' }}>{CHAIN_LABELS[toChain]}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>To</div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Amount (USDC)</label>
            <input value={amount} onChange={e => { setAmount(e.target.value); setStatus(null); }} placeholder="0.00" type="number" style={inputStyle} />
          </div>

          <button onClick={bridgeUSDC} disabled={loading || !account || !amount} style={{
            width: '100%',
            background: loading || !account || !amount ? '#3d3d5c' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', padding: '14px', borderRadius: '10px',
            cursor: loading || !account || !amount ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '700',
          }}>
            {!account ? 'Connect Wallet' : loading ? 'Processing...' : `Bridge ${amount || '0'} USDC → ${CHAIN_LABELS[toChain]}`}
          </button>

          {stepMsg && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#1e1e2e', borderRadius: '10px', color: '#8b5cf6', fontSize: '13px' }}>
              ⟳ {stepMsg}
            </div>
          )}

          {status && status !== 'success' && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#2a0d0d', border: '1px solid #f8717144', borderRadius: '10px', color: '#f87171', fontSize: '13px' }}>
              {status}
            </div>
          )}

          {status === 'success' && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#0d2a1a', border: '1px solid #22c55e44', borderRadius: '10px' }}>
              <div style={{ color: '#22c55e', fontWeight: '700', marginBottom: '8px' }}>✓ Bridge Complete!</div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '8px' }}>
                USDC başarıyla {CHAIN_LABELS[toChain]} ağına ulaştı!
              </div>
              {txHash && (
                <a href={`${CHAIN_EXPLORER[fromChain]}/tx/${txHash}`} target="_blank" rel="noreferrer"
                  style={{ color: '#8b5cf6', fontSize: '12px', wordBreak: 'break-all', textDecoration: 'none' }}>
                  View Tx ↗
                </a>
              )}
            </div>
          )}
        </div>

        <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px', minWidth: '200px' }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>How It Works</div>
          {[
            { n: '1', t: 'Approve', d: 'One-time USDC approval', c: '#6366f1' },
            { n: '2', t: 'Burn', d: 'USDC burned on source', c: '#8b5cf6' },
            { n: '3', t: 'Attest', d: 'Circle verifies burn', c: '#a78bfa' },
            { n: '4', t: 'Mint', d: 'USDC minted on dest', c: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: s.c + '22', border: '2px solid ' + s.c, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.c, fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>{s.n}</div>
              <div>
                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>{s.t}</div>
                <div style={{ color: '#555', fontSize: '11px' }}>{s.d}</div>
              </div>
            </div>
          ))}
          <div style={{ padding: '12px', background: '#1e1e2e', borderRadius: '10px', marginTop: '8px' }}>
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Powered by</div>
            <div style={{ color: '#8b5cf6', fontSize: '13px', fontWeight: '600' }}>Circle Bridge Kit</div>
            <div style={{ color: '#555', fontSize: '11px' }}>CCTP V2 Native Bridge</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bridge;