import { renderProposalsPage } from './pages/proposals.js';
import { renderRulesPage } from './pages/rules.js';
import { renderPaymentsPage } from './pages/payments.js';
import { renderDelegatesPage } from './pages/delegates.js';

export function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      const page = link.getAttribute('data-page');
      navigateToPage(page);
    });
  });

  const hash = window.location.hash.slice(1) || 'proposals';
  navigateToPage(hash);

  window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'proposals';
    navigateToPage(page);
  });
}

function navigateToPage(page) {
  const mainContent = document.getElementById('main-content');

  switch (page) {
    case 'proposals':
      renderProposalsPage(mainContent);
      break;
    case 'delegates':
      renderDelegatesPage(mainContent);
      break;
    case 'rules':
      renderRulesPage(mainContent);
      break;
    case 'payments':
      renderPaymentsPage(mainContent);
      break;
    default:
      renderProposalsPage(mainContent);
  }

  window.location.hash = page;
}
