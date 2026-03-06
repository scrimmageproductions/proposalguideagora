import { ethers } from 'ethers';

let provider = null;
let signer = null;
let userAddress = null;

export function initWallet() {
  const connectButton = document.getElementById('connect-wallet');

  connectButton.addEventListener('click', async () => {
    await connectWallet();
  });

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        userAddress = accounts[0];
        updateWalletUI();
      }
    });
  }

  checkConnection();
}

async function checkConnection() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        updateWalletUI();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    alert('MetaMask is not installed. Please install MetaMask to use this application.');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = accounts[0];

    updateWalletUI();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet. Please try again.');
  }
}

function disconnectWallet() {
  provider = null;
  signer = null;
  userAddress = null;
  updateWalletUI();
}

function updateWalletUI() {
  const connectButton = document.getElementById('connect-wallet');

  if (userAddress) {
    const shortAddress = `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`;
    connectButton.textContent = shortAddress;
    connectButton.disabled = false;
  } else {
    connectButton.textContent = 'Connect Wallet';
    connectButton.disabled = false;
  }
}

export function getWalletInfo() {
  return {
    provider,
    signer,
    userAddress,
    isConnected: !!userAddress
  };
}
