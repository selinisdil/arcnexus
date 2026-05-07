import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const SWAP_ADDRESS = "0x6e40f9AEB9cA2B24c2049F1553Fb3D272c114408";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
];

const SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) returns (uint256)",
  "function getAmountOut(address tokenIn, uint256 amountIn) view returns (uint256)",
  "function getPoolBalances() view returns (uint256, uint256)",
];

const Swap = ({ account }) => {
  const [direction, setDirection] = useState('USDC_to_EURC');
  const [amount, setAmount] = useState('');
  const [estimatedOut, setEstimatedOut] = useState('0.0000');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [poolBalances, setPoolBalances] = useState({ usdc: '0', eurc: '0' });

  const tokenIn  = direction === 'USDC_to_EURC' ? 'USDC' : 'EURC';
  const tokenOut = direction === 'USDC_to_EURC' ? 'EURC' : 'USDC';
  const tokenInAddress  = direction === 'USDC_to_EURC' ? USDC : EURC;
  const tokenOutAddress = direction === 'USDC_to_EURC' ? EURC : USDC;

  useEffect(() => {
    loadPoolBalances();
  }, []);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      getEstimate();
    } else {
      setEstimatedOut('0.0000');
    }
  }, [amount, direction]);

  const loadPoolBalances = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
      const swap = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, provider);
      const [usdc, eurc] = await swap.getPoolBalances();
      setPoolBalances({
        usdc: parseFloat(ethers.formatUnits(usdc, 6)).toFixed(4),
        eurc: parseFloat(ethers.formatUnits(eurc, 6)).toFixed(4),
      });
    } catch (e) {}
  };

  const getEstimate = async () => {
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc.testnet.arc.network");
      const swap = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, provider);
      const amountIn = ethers.parseUnits(amount, 6);
      const out = await swap.getAmountOut(tokenInAddress, amountIn);
      setEstimatedOut(parseFloat(ethers.formatUnits(out, 6)).toFixed(4));
    } catch (e) {}
  };

  const executeSwap = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setStatus(null);
    setTxHash(null);

    try {
      setStatus('Switching to Arc Testnet...');
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x4cef52' }],
      });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tokenInContract = new ethers.Contract(tokenInAddress, ERC20_ABI, signer);
      const swapContract = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, signer);

      const amountIn = ethers.parseUnits(amount, 6);

      // Check balance
      const balance = await tokenInContract.balanceOf(account);
      if (balance < amountIn) {
        setStatus(`Insufficient ${tokenIn} balance.`);
        setLoading(false);
        return;
      }

      // Approve
      setStatus(`Approving ${tokenIn}... Confirm in MetaMask.`);
      const allowance = await tokenInContract.allowance(account, SWAP_ADDRESS);
      if (allowance < amountIn) {
        const approveTx = await tokenInContract.approve(SWAP_ADDRESS, amountIn);
        setStatus('Waiting for approval confirmation...');
        await approveTx.wait();
      }

      // Swap
      setStatus(`Swapping ${tokenIn} → ${tokenOut}... Confirm in MetaMask.`);
      const tx = await swapContract.swap(tokenInAddress, tokenOutAddress, amountIn);
      setStatus('Waiting for swap confirmation...');
      await tx.wait();

      setTxHash(tx.hash);
      setStatus('success');
      setAmount('');
      loadPoolBalances();
    } catch (err) {
      console.error(err);
      if (err.code === 4001) {
        setStatus('Transaction rejected by user.');
      } else {
        setStatus('Error: ' + (err.reason || err.message));
      }
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', background: '#1e1e2e', border: '1px solid #3d3d5c',
    borderRadius: '10px', padding: '12px 16px', color: '#fff',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box'
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>Swap</h2>
        <p style={{ color: '#888' }}>Swap USDC ↔ EURC on Arc Testnet</p>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '32px', maxWidth: '480px', flex: 1 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px', background: '#1e1e2e', borderRadius: '12px' }}>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#6366f1', fontWeight: '700', fontSize: '18px' }}>{tokenIn}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>You pay</div>
            </div>
            <button
              onClick={() => { setDirection(d => d === 'USDC_to_EURC' ? 'EURC_to_USDC' : 'USDC_to_EURC'); setAmount(''); setStatus(null); setTxHash(null); }}
              style={{ background: '#8b5cf622', border: '1px solid #8b5cf6', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: '#8b5cf6', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
            >⇄</button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ color: '#8b5cf6', fontWeight: '700', fontSize: '18px' }}>{tokenOut}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>You receive</div>
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Amount ({tokenIn})</label>
            <input value={amount} onChange={e => { setAmount(e.target.value); setStatus(null); }} placeholder="0.00" type="number" style={inputStyle} />
          </div>

          <div style={{ marginBottom: '24px', padding: '14px 16px', background: '#1e1e2e', borderRadius: '10px' }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>You receive (estimated)</div>
            <div style={{ color: '#22c55e', fontSize: '20px', fontWeight: '700' }}>{estimatedOut} {tokenOut}</div>
          </div>

          <button onClick={executeSwap} disabled={loading || !amount || !account} style={{
            width: '100%',
            background: loading || !amount || !account ? '#3d3d5c' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff', border: 'none', padding: '14px',
            borderRadius: '10px', cursor: loading || !amount || !account ? 'not-allowed' : 'pointer',
            fontSize: '15px', fontWeight: '700'
          }}>
            {!account ? 'Connect Wallet' : loading ? 'Swapping...' : `Swap ${tokenIn} → ${tokenOut}`}
          </button>

          {status && status !== 'success' && (
            <div style={{ marginTop: '16px', padding: '12px 16px', background: '#1e1e2e', borderRadius: '10px', color: '#888', fontSize: '13px' }}>
              {status}
            </div>
          )}

          {status === 'success' && txHash && (
            <div style={{ marginTop: '16px', padding: '16px', background: '#0d2a1a', border: '1px solid #22c55e44', borderRadius: '10px' }}>
              <div style={{ color: '#22c55e', fontWeight: '700', marginBottom: '8px' }}>Swap Successful!</div>
              <a href={`https://testnet.arcscan.app/tx/${txHash}`} target="_blank" rel="noreferrer"
                style={{ color: '#8b5cf6', fontSize: '12px', wordBreak: 'break-all', textDecoration: 'none' }}>
                View on Explorer ↗
              </a>
            </div>
          )}
        </div>

        <div style={{ background: '#0d0d1a', border: '1px solid #1e1e2e', borderRadius: '16px', padding: '24px', minWidth: '200px' }}>
          <div style={{ color: '#888', fontSize: '13px', marginBottom: '16px' }}>How It Works</div>
          {[
            { n: '1', t: 'Enter Amount', d: 'How much to swap', c: '#6366f1' },
            { n: '2', t: 'Approve', d: 'One-time token approval', c: '#8b5cf6' },
            { n: '3', t: 'Swap', d: 'On-chain execution', c: '#a78bfa' },
            { n: '4', t: 'Done', d: 'Tokens in your wallet', c: '#22c55e' },
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
            <div style={{ color: '#888', fontSize: '11px', marginBottom: '4px' }}>Contract</div>
            <div style={{ color: '#8b5cf6', fontSize: '11px', wordBreak: 'break-all' }}>{SWAP_ADDRESS}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Swap;