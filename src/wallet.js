import { ethers } from 'ethers';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers';

let provider = null;
let signer = null;
let userAddress = null;
let web3Modal = null;
let connectionType = null;

const projectId = '8f1a3b9e6c7d2a5f4e3b1c9d8a7f6e5d';

const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://eth.llamarpc.com'
};

const metadata = {
  name: 'PizzaDAO Governance',
  description: 'Decentralized governance for pizza lovers',
  url: window.location.origin,
  icons: [`${window.location.origin}/assets/logo.png`]
};

export function initWallet() {
  web3Modal = createWeb3Modal({
    ethersConfig: defaultConfig({ metadata }),
    chains: [mainnet],
    projectId,
    enableAnalytics: false
  });

  const connectButton = document.getElementById('connect-wallet');

  connectButton.addEventListener('click', async () => {
    showWalletOptions();
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

  web3Modal.subscribeProvider(({ address, isConnected }) => {
    if (isConnected && address && connectionType === 'walletconnect') {
      userAddress = address;
      updateWalletUI();
    } else if (!isConnected && connectionType === 'walletconnect') {
      disconnectWallet();
    }
  });

  checkConnection();
}

function showWalletOptions() {
  const existingModal = document.getElementById('wallet-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.id = 'wallet-modal';
  modal.innerHTML = `
    <div class="modal-overlay">
      <div class="modal-content">
        <h2>Connect Wallet</h2>
        <button class="wallet-option" id="metamask-option">
          <span>MetaMask</span>
        </button>
        <button class="wallet-option" id="walletconnect-option">
          <span>WalletConnect</span>
        </button>
        <button class="modal-close" id="close-modal">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('metamask-option').addEventListener('click', () => {
    connectMetaMask();
    modal.remove();
  });

  document.getElementById('walletconnect-option').addEventListener('click', () => {
    connectWalletConnect();
    modal.remove();
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      modal.remove();
    }
  });
}

async function checkConnection() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
        userAddress = accounts[0];
        connectionType = 'metamask';
        updateWalletUI();
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  }
}

async function connectMetaMask() {
  if (!window.ethereum) {
    alert('MetaMask is not installed. Please install MetaMask to use this application.');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userAddress = accounts[0];
    connectionType = 'metamask';

    updateWalletUI();
  } catch (error) {
    console.error('Error connecting wallet:', error);
    alert('Failed to connect wallet. Please try again.');
  }
}

async function connectWalletConnect() {
  try {
    await web3Modal.open();
    const walletProvider = web3Modal.getWalletProvider();

    if (walletProvider) {
      provider = new ethers.BrowserProvider(walletProvider);
      signer = await provider.getSigner();
      userAddress = await signer.getAddress();
      connectionType = 'walletconnect';
      updateWalletUI();
    }
  } catch (error) {
    console.error('Error connecting WalletConnect:', error);
    alert('Failed to connect wallet. Please try again.');
  }
}

function disconnectWallet() {
  if (connectionType === 'walletconnect' && web3Modal) {
    web3Modal.disconnect();
  }

  provider = null;
  signer = null;
  userAddress = null;
  connectionType = null;
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
