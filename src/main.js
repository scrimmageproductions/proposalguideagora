import './styles.css';
import { initPepperoniRain } from './pepperoniRain.js';
import { initRouter } from './router.js';
import { initWallet } from './wallet.js';

document.addEventListener('DOMContentLoaded', () => {
  initPepperoniRain();
  initWallet();
  initRouter();
});
