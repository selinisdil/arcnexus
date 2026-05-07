export const CONTRACTS = {
  arc: {
    USDC: '0x3600000000000000000000000000000000000000',
    EURC: '0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a',
  },
  sepolia: {
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    EURC: '0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bef',
    tokenMessenger: '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5',
  }
};

export const CHAINS = {
  arc: {
    chainId: '0x4cef52',
    chainName: 'Arc Testnet',
    rpc: 'https://rpc.testnet.arc.network',
    explorer: 'https://testnet.arcscan.app',
    nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 }
  },
  sepolia: {
    chainId: '0xaa36a7',
    chainName: 'Ethereum Sepolia',
    rpc: 'https://ethereum-sepolia-rpc.publicnode.com',
    explorer: 'https://sepolia.etherscan.io',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 }
  }
};

export const TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const switchToChain = async (chainKey) => {
  const chain = CHAINS[chainKey];
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chain.chainId }],
    });
  } catch (err) {
    if (err.code === 4902 || err.code === -32603) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: chain.chainId,
          chainName: chain.chainName,
          rpcUrls: [chain.rpc],
          blockExplorerUrls: [chain.explorer],
          nativeCurrency: chain.nativeCurrency
        }],
      });
    } else {
      throw err;
    }
  }
};