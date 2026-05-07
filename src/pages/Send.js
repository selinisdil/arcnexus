import React, { useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACTS, CHAINS, TOKEN_ABI } from '../utils/constants';

const Send = ({ account }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [token, setToken] = useState('USDC');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(null);

  const sendTokens = async () => {
    if (!account) return alert('Please connect your wallet!');
    if (!recipient || !amount) return alert('Please enter address and amount!');
    if (!ethers.isAddress(recipient)) return alert('Invalid address!');

    setLoading(true);
    setStatus('Switching to Arc Testnet...');
    setTxHash(null);

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CHAINS.arc.chainId }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenAddress = token === 'USDC' ? CONTRACTS.arc.USDC : CONTRACTS.arc.EURC;
      const contract = new ethers.Contract(tokenAddress, TOKEN_ABI, signer);
      const decimals = await contract.decimals();
      const amountInUnits = ethers.parseUnits(amount, decimals);

      setStatus('Waiting for MetaMask approval...');
      const tx = await contract.transfer(recipient, amountInUnits);

      setStatus('Transaction sent, confirming...');
      await tx.wait();

      setTxHash(tx.hash);
      setStatus('success');
      setRecipient('');
      setAmount('');
    } catch (err) {
      console.error(err);
      setStatus('Error: ' + (err.reason || err.message));
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    background: '#1e1e2e',
    border: '1px solid #3d3d5c',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Send</h2>
        <p style={{ color: '#888' }}>Send USDC or EURC on Arc Testnet</p>
      </div>

      <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '32px', maxWidth: '480px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Token</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {['USDC', 'EURC'].map(t => (
              <button key={t} onClick={() => setToken(t)} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '10px',
                border: '1px solid ' + (token === t ? '#8b5cf6' : '#3d3d5c'),
                background: token === t ? '#8b5cf622' : '#1e1e2e',
                color: token === t ? '#8b5cf6' : '#888',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px'
              }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Recipient Address</label>
          <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." style={inputStyle} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Amount ({token})</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" type="number" style={inputStyle} />
        </div>

        <button onClick={sendTokens} disabled={loading} style={{
          width: '100%',
          background: loading ? '#3d3d5c' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff',
          border: 'none',
          padding: '14px',
          borderRadius: '10px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '15px',
          fontWeight: '700'
        }}>
          {loading ? 'Sending...' : 'Send ' + token}
        </button>

        {status && status !== 'success' && (
          <div style={{ marginTop: '16px', padding: '12px 16px', background: '#1e1e2e', borderRadius: '10px', color: '#888', fontSize: '13px' }}>
            {status}
          </div>
        )}

        {status === 'success' && txHash && (
          <div style={{ marginTop: '16px', padding: '16px', background: '#0d2a1a', border: '1px solid #22c55e44', borderRadius: '10px' }}>
            <div style={{ color: '#22c55e', fontWeight: '700', marginBottom: '8px' }}>Successfully Sent!</div>
            <div style={{ color: '#8b5cf6', fontSize: '12px', wordBreak: 'break-all' }}>TX: {txHash}</div>
          </div>
        )}

        <div style={{ marginTop: '20px', padding: '12px 16px', background: '#1e1e2e', borderRadius: '10px' }}>
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Arc Testnet Contracts</div>
          <div style={{ color: '#555', fontSize: '11px' }}>USDC: {CONTRACTS.arc.USDC.slice(0,10)}...</div>
          <div style={{ color: '#555', fontSize: '11px' }}>EURC: {CONTRACTS.arc.EURC.slice(0,10)}...</div>
        </div>
      </div>
    </div>
  );
};

export default Send;