import { ethers } from "ethers";

const PRIVATE_KEY = "0xa4255d153137bb9c0c3cec387eb7d97c089768ec31273b2b7015b4b1d6b5ee90";
const RPC_URL = "https://rpc.testnet.arc.network";
const SWAP_ADDRESS = "0x6e40f9AEB9cA2B24c2049F1553Fb3D272c114408";
const USDC = "0x3600000000000000000000000000000000000000";
const EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
];

const SWAP_ABI = [
  "function addLiquidity(address token, uint256 amount) external",
  "function getPoolBalances() view returns (uint256, uint256)",
];

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const usdc = new ethers.Contract(USDC, ERC20_ABI, wallet);
const eurc = new ethers.Contract(EURC, ERC20_ABI, wallet);
const swap = new ethers.Contract(SWAP_ADDRESS, SWAP_ABI, wallet);

const usdcBal = await usdc.balanceOf(wallet.address);
const eurcBal = await eurc.balanceOf(wallet.address);
console.log("USDC balance:", ethers.formatUnits(usdcBal, 6));
console.log("EURC balance:", ethers.formatUnits(eurcBal, 6));

// Bakiyenin %80'ini ekle
const usdcAmount = usdcBal * 80n / 100n;
const eurcAmount = eurcBal * 80n / 100n;

console.log("Adding USDC:", ethers.formatUnits(usdcAmount, 6));
console.log("Adding EURC:", ethers.formatUnits(eurcAmount, 6));

console.log("Approving USDC...");
await (await usdc.approve(SWAP_ADDRESS, usdcAmount)).wait();
console.log("Adding USDC liquidity...");
await (await swap.addLiquidity(USDC, usdcAmount)).wait();

console.log("Approving EURC...");
await (await eurc.approve(SWAP_ADDRESS, eurcAmount)).wait();
console.log("Adding EURC liquidity...");
await (await swap.addLiquidity(EURC, eurcAmount)).wait();

const [poolUsdc, poolEurc] = await swap.getPoolBalances();
console.log("Pool USDC:", ethers.formatUnits(poolUsdc, 6));
console.log("Pool EURC:", ethers.formatUnits(poolEurc, 6));
console.log("Done!");