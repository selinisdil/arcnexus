# ⚡ ArcNexus

> The Complete DeFi Gateway — Built on Arc Testnet

🌐 **Live Site:** [arcnexus.netlify.app](https://arcnexus.netlify.app)
💾 **GitHub:** [github.com/selinisdil/arcnexus](https://github.com/selinisdil/arcnexus)
🐦 **X (Twitter):** [x.com/selinisdil](https://x.com/selinisdil?s=21)

---

## ✨ Features

### 🌉 Bridge
Cross-chain USDC transfers powered by **Circle CCTP V2**. Fast, secure, trustless bridging between Arc Testnet and Ethereum Sepolia.

### 🔄 Swap
Swap **USDC ↔ EURC** on Arc Testnet with real-time price estimates via on-chain AMM contract.

### 🛡️ Refund Pay
On-chain escrow payment system with full dispute resolution:
- Lock USDC or EURC in a smart contract
- Recipient delivers service
- Sender approves → funds released
- Dispute raised → Arbiter decides

### 📊 Dashboard
Track your USDC and EURC balances across Arc Testnet and Ethereum Sepolia in one place.

### 📜 History
Full transaction history with real-time updates via Arc API with automatic refresh.

---

## 📦 Smart Contracts

All contracts are deployed on **Arc Testnet (Chain ID: 5042002)**.

### Escrow Contract (RefundPay)
```
Address:  0xbDC1e9bf597458A02De818c10dA70061BbE5d514
Explorer: https://testnet.arcscan.app/address/0xbDC1e9bf597458A02De818c10dA70061BbE5d514
```

**Contract States:**
```
PENDING   → Payment locked, waiting for approval
COMPLETED → Sender approved, funds sent to recipient
REFUNDED  → Arbiter refunded funds back to sender
DISPUTED  → Under dispute, waiting for arbiter decision
```

**Key Functions:**
```solidity
createPayment(recipient, arbiter, token, amount, description)
approvePayment(id)   // Sender or arbiter releases funds
refundPayment(id)    // Arbiter refunds to sender
disputePayment(id)   // Sender or recipient raises dispute
getPayment(id)       // Read payment details
```

### Swap Contract
```
Address:  0x6e40f9AEB9cA2B24c2049F1553Fb3D272c114408
Explorer: https://testnet.arcscan.app/address/0x6e40f9AEB9cA2B24c2049F1553Fb3D272c114408
```

**Key Functions:**
```solidity
swap(tokenIn, tokenOut, amountIn)
getAmountOut(tokenIn, amountIn)
getPoolBalances()
```

### Token Addresses (Arc Testnet)
```
USDC: 0x3600000000000000000000000000000000000000
EURC: 0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a
```

---

## 🌉 Bridge — Circle CCTP V2

**How it works:**
1. User approves USDC to the CCTP contract on Arc
2. `depositForBurn()` is called — USDC is burned on source chain
3. Circle attestation service signs the burn proof
4. `receiveMessage()` is called on destination chain — USDC is minted

**Supported Routes:**
```
Arc Testnet      →  Ethereum Sepolia
Ethereum Sepolia →  Arc Testnet
```

---

## 🛡️ RefundPay — Escrow Flow

```
[Sender] → createPayment() → [Smart Contract locks funds]
                                        ↓
                             [Recipient delivers]
                                        ↓
            ┌─────────────────────────────────────────┐
            │                                         │
         [Approve]                               [Dispute]
            │                                         │
  funds → recipient                         arbiter decides
                                           /               \
                                      [Approve]          [Refund]
                                   funds→recipient    funds→sender
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|---|---|
| React.js | Frontend |
| ethers.js v6 | Wallet & contract interaction |
| Circle CCTP V2 | Cross-chain bridge protocol |
| Solidity 0.8.19 | Smart contracts |
| Hardhat 2.x | Contract development & deployment |
| Arc Testnet | EVM-compatible network |
| Netlify | Hosting |

---

## 🌐 Network Configuration

Add Arc Testnet to MetaMask:

| Field | Value |
|---|---|
| Network Name | Arc Testnet |
| RPC URL | https://rpc.testnet.arc.network |
| Chain ID | 5042002 |
| Currency Symbol | ARC |
| Block Explorer | https://testnet.arcscan.app |

---

## 🚀 Getting Started

```bash
git clone https://github.com/selinisdil/arcnexus.git
cd arcnexus
npm install
npm start
```

---

## 🔗 Links

| | |
|---|---|
| 🌐 Live Site | [arcnexus.netlify.app](https://arcnexus.netlify.app) |
| 💾 GitHub | [github.com/selinisdil/arcnexus](https://github.com/selinisdil/arcnexus) |
| 🐦 X (Twitter) | [x.com/selinisdil](https://x.com/selinisdil?s=21) |
| 🔍 Explorer | [testnet.arcscan.app](https://testnet.arcscan.app) |
| 📚 Arc Docs | [docs.arc.network](https://docs.arc.network) |

---

## 📄 License

MIT