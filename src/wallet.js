import '@reown/appkit-polyfills';
import { createAppKit } from '@reown/appkit';
import { EthersAdapter } from '@reown/appkit-adapter-ethers';
import { mainnet, sepolia } from '@reown/appkit/networks';
import { ethers } from 'ethers';

let modal = null;
let provider = null;
let signer = null;
let userAddress = null;

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

const metadata = {
  name: 'PizzaDAO Governance',
  description: 'Onchain governance platform for PizzaDAO',
  url: window.location.origin,
  icons: [`${window.location.origin}/assets/logo.png`]
};

const ethersAdapter = new EthersAdapter();

export function initWallet() {
  modal = createAppKit({
    adapters: [ethersAdapter],
    networks: [mainnet, sepolia],
    metadata,
    projectId,
    features: {
      analytics: false,
      email: false,
      socials: []
    },
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#7DD3E8',
      '--w3m-border-radius-master': '8px'
    }
  });

  const connectButton = document.getElementById('connect-wallet');

  connectButton.addEventListener('click', async () => {
    await modal.open();
  });

  modal.subscribeProvider(async (state) => {
    if (state.isConnected && state.address) {
      userAddress = state.address;

      if (state.provider) {
        provider = new ethers.BrowserProvider(state.provider);
        signer = await provider.getSigner();
      } else if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();
      }

      updateWalletUI();
    } else {
      disconnectWallet();
    }
  });

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== userAddress) {
        userAddress = accounts[0];
        if (provider) {
          signer = await provider.getSigner();
        }
        updateWalletUI();
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }

  checkConnection();
}

async function checkConnection() {
  const walletProvider = modal?.getWalletProvider();

  if (walletProvider) {
    try {
      const ethersProvider = new ethers.BrowserProvider(walletProvider);
      const accounts = await ethersProvider.listAccounts();

      if (accounts.length > 0) {
        provider = ethersProvider;
        signer = await provider.getSigner();
        userAddress = await signer.getAddress();
        updateWalletUI();
      }
    } catch (error) {
      console.error('Error checking WalletConnect connection:', error);
    }
  } else if (window.ethereum) {
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

export function getAppKitModal() {
  return modal;
}
