import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Bridge from './pages/Bridge';
import Send from './pages/Send';
import Swap from './pages/Swap';
import History from './pages/History';
import RefundPay from './pages/RefundPay';
import Landing from './pages/Landing';

function App() {
  const [account, setAccount] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      } else {
        setAccount(null);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard account={account} />;
      case 'bridge': return <Bridge account={account} />;
      case 'send': return <Send account={account} />;
      case 'swap': return <Swap account={account} />;
      case 'refundpay': return <RefundPay account={account} />;
      case 'history': return <History account={account} />;
      default: return <Dashboard account={account} />;
    }
  };

  if (showLanding) {
    return <Landing onEnter={() => setShowLanding(false)} />;
  }

  return (
    <div className="app" style={{
      background: '#06060f',
      minHeight: '100vh',
    }}>
      <Navbar
        account={account}
        connectWallet={connectWallet}
        disconnectWallet={disconnectWallet}
        activePage={activePage}
        setActivePage={setActivePage}
      />
      <div className="main-content">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;