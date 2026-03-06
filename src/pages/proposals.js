import { getWalletInfo } from '../wallet.js';
import { supabase } from '../supabase.js';

let currentProposal = null;

export async function renderProposalsPage(container) {
  container.innerHTML = `
    <div class="container">
      <h1 class="page-title">Governance Proposals</h1>
      <div id="proposals-list" class="proposals-grid">
        <p style="color: white; text-align: center; width: 100%;">Loading proposals...</p>
      </div>
    </div>

    <button class="create-proposal-btn" id="create-proposal-btn">+</button>

    <div class="modal-overlay" id="proposal-modal">
      <div class="modal-content">
        <button class="modal-close" id="close-modal">&times;</button>
        <div id="modal-body"></div>
      </div>
    </div>

    <div class="modal-overlay" id="create-modal">
      <div class="modal-content">
        <button class="modal-close" id="close-create-modal">&times;</button>
        <h2 style="margin-bottom: 24px;">Create New Proposal</h2>
        <form id="create-proposal-form">
          <div class="form-group">
            <label for="proposal-title">Proposal Title</label>
            <input type="text" id="proposal-title" required placeholder="e.g., ETHDenver Pizza Party">
          </div>

          <div class="form-group">
            <label for="proposal-description">Description</label>
            <textarea id="proposal-description" required placeholder="Describe your proposal and how it benefits PizzaDAO..."></textarea>
          </div>

          <div class="form-group">
            <label for="proposal-image">Image URL (optional)</label>
            <input type="url" id="proposal-image" placeholder="https://...">
          </div>

          <div class="form-group">
            <label for="proposal-funding">Funding Amount (USD)</label>
            <input type="number" id="proposal-funding" min="0" step="0.01" required placeholder="0.00">
          </div>

          <div class="form-group">
            <label for="proposal-threshold">Vote Threshold</label>
            <select id="proposal-threshold" required>
              <option value="15">15 votes (≤ $625)</option>
              <option value="25">25 votes ($625–$2,500)</option>
              <option value="35">35 votes (> $2,500)</option>
            </select>
          </div>

          <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">Submit Proposal</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('create-proposal-btn').addEventListener('click', () => {
    const wallet = getWalletInfo();
    if (!wallet.isConnected) {
      alert('Please connect your wallet to create a proposal.');
      return;
    }
    document.getElementById('create-modal').classList.add('active');
  });

  document.getElementById('close-create-modal').addEventListener('click', () => {
    document.getElementById('create-modal').classList.remove('active');
  });

  document.getElementById('close-modal').addEventListener('click', () => {
    document.getElementById('proposal-modal').classList.remove('active');
  });

  document.getElementById('create-proposal-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleCreateProposal();
  });

  await loadProposals();
}

async function loadProposals() {
  try {
    const { data: proposals, error } = await supabase
      .from('proposals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const proposalsContainer = document.getElementById('proposals-list');

    if (!proposals || proposals.length === 0) {
      proposalsContainer.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No proposals yet. Create the first one!</p>';
      return;
    }

    const proposalsWithVotes = await Promise.all(
      proposals.map(async (proposal) => {
        const { data: votes } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('proposal_id', proposal.id);

        const ayes = votes?.filter(v => v.vote_type === 'aye').length || 0;
        const nays = votes?.filter(v => v.vote_type === 'nay').length || 0;
        const abstains = votes?.filter(v => v.vote_type === 'abstain').length || 0;

        return { ...proposal, ayes, nays, abstains };
      })
    );

    proposalsContainer.innerHTML = proposalsWithVotes.map(proposal => `
      <div class="proposal-card" data-proposal-id="${proposal.id}">
        <div class="proposal-header">
          <h3 class="proposal-title">${proposal.title}</h3>
          <span class="status-badge status-${proposal.status}">${proposal.status}</span>
        </div>
        <p class="proposal-description">${proposal.description}</p>
        <div class="proposal-meta">
          <span>Funding: $${Number(proposal.funding_amount).toFixed(2)}</span>
          <span>Threshold: ${proposal.vote_threshold} votes</span>
          ${proposal.end_date ? `<span>Ends: ${new Date(proposal.end_date).toLocaleDateString()}</span>` : ''}
        </div>
        <div class="vote-counts">
          <div class="vote-count vote-aye">
            <span>👍</span>
            <span>${proposal.ayes}</span>
          </div>
          <div class="vote-count vote-nay">
            <span>👎</span>
            <span>${proposal.nays}</span>
          </div>
          <div class="vote-count vote-abstain">
            <span>🤷</span>
            <span>${proposal.abstains}</span>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.proposal-card').forEach(card => {
      card.addEventListener('click', async () => {
        const proposalId = card.getAttribute('data-proposal-id');
        await showProposalDetail(proposalId, proposalsWithVotes);
      });
    });

  } catch (error) {
    console.error('Error loading proposals:', error);
    document.getElementById('proposals-list').innerHTML =
      '<p style="color: white; text-align: center; width: 100%;">Error loading proposals. Please try again.</p>';
  }
}

async function showProposalDetail(proposalId, proposals) {
  const proposal = proposals.find(p => p.id === proposalId);
  if (!proposal) return;

  currentProposal = proposal;

  const wallet = getWalletInfo();

  const { data: userVote } = wallet.isConnected ? await supabase
    .from('votes')
    .select('vote_type')
    .eq('proposal_id', proposalId)
    .eq('voter_address', wallet.userAddress)
    .maybeSingle() : { data: null };

  const isActive = proposal.status === 'active';
  const hasVoted = !!userVote;

  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = `
    <h2 style="margin-bottom: 16px;">${proposal.title}</h2>
    <span class="status-badge status-${proposal.status}" style="margin-bottom: 16px; display: inline-block;">
      ${proposal.status}
    </span>

    ${proposal.image_url ? `<img src="${proposal.image_url}" alt="${proposal.title}" style="width: 100%; border-radius: 8px; margin-bottom: 16px;">` : ''}

    <p style="line-height: 1.6; margin-bottom: 16px; white-space: pre-wrap;">${proposal.description}</p>

    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <p><strong>Proposer:</strong> ${proposal.proposer_address.slice(0, 6)}...${proposal.proposer_address.slice(-4)}</p>
      <p><strong>Funding Amount:</strong> $${Number(proposal.funding_amount).toFixed(2)}</p>
      <p><strong>Vote Threshold:</strong> ${proposal.vote_threshold} votes</p>
      ${proposal.start_date ? `<p><strong>Start Date:</strong> ${new Date(proposal.start_date).toLocaleString()}</p>` : ''}
      ${proposal.end_date ? `<p><strong>End Date:</strong> ${new Date(proposal.end_date).toLocaleString()}</p>` : ''}
    </div>

    <div class="vote-counts" style="justify-content: space-around; padding: 16px; background: #f9f9f9; border-radius: 8px;">
      <div class="vote-count vote-aye" style="flex-direction: column; align-items: center;">
        <span style="font-size: 32px;">👍</span>
        <span style="font-size: 24px;">${proposal.ayes}</span>
        <span style="font-size: 12px;">Aye</span>
      </div>
      <div class="vote-count vote-nay" style="flex-direction: column; align-items: center;">
        <span style="font-size: 32px;">👎</span>
        <span style="font-size: 24px;">${proposal.nays}</span>
        <span style="font-size: 12px;">Nay</span>
      </div>
      <div class="vote-count vote-abstain" style="flex-direction: column; align-items: center;">
        <span style="font-size: 32px;">🤷</span>
        <span style="font-size: 24px;">${proposal.abstains}</span>
        <span style="font-size: 12px;">Abstain</span>
      </div>
    </div>

    ${isActive && wallet.isConnected && !hasVoted ? `
      <div class="vote-buttons">
        <button class="vote-btn vote-btn-aye" data-vote="aye">Aye</button>
        <button class="vote-btn vote-btn-nay" data-vote="nay">Nay</button>
        <button class="vote-btn vote-btn-abstain" data-vote="abstain">Abstain</button>
      </div>
    ` : ''}

    ${hasVoted ? `<p style="text-align: center; margin-top: 16px; color: #4CAF50; font-weight: 800;">You voted: ${userVote.vote_type.toUpperCase()}</p>` : ''}
    ${!wallet.isConnected ? `<p style="text-align: center; margin-top: 16px; color: #666;">Connect your wallet to vote</p>` : ''}
    ${!isActive ? `<p style="text-align: center; margin-top: 16px; color: #666;">Voting has ended</p>` : ''}
  `;

  if (isActive && wallet.isConnected && !hasVoted) {
    document.querySelectorAll('.vote-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const voteType = btn.getAttribute('data-vote');
        await handleVote(proposalId, voteType);
      });
    });
  }

  document.getElementById('proposal-modal').classList.add('active');
}

async function handleVote(proposalId, voteType) {
  const wallet = getWalletInfo();

  if (!wallet.isConnected) {
    alert('Please connect your wallet to vote.');
    return;
  }

  try {
    const { error } = await supabase
      .from('votes')
      .insert({
        proposal_id: proposalId,
        voter_address: wallet.userAddress,
        vote_type: voteType,
        is_anonymous: true
      });

    if (error) throw error;

    alert('Vote submitted successfully!');
    document.getElementById('proposal-modal').classList.remove('active');
    await loadProposals();
  } catch (error) {
    console.error('Error submitting vote:', error);
    alert('Failed to submit vote. You may have already voted on this proposal.');
  }
}

async function handleCreateProposal() {
  const wallet = getWalletInfo();

  if (!wallet.isConnected) {
    alert('Please connect your wallet to create a proposal.');
    return;
  }

  const title = document.getElementById('proposal-title').value;
  const description = document.getElementById('proposal-description').value;
  const imageUrl = document.getElementById('proposal-image').value;
  const fundingAmount = document.getElementById('proposal-funding').value;
  const voteThreshold = document.getElementById('proposal-threshold').value;

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

  try {
    const { error } = await supabase
      .from('proposals')
      .insert({
        title,
        description,
        image_url: imageUrl || null,
        proposer_address: wallet.userAddress,
        funding_amount: fundingAmount,
        vote_threshold: parseInt(voteThreshold),
        status: 'active',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    if (error) throw error;

    alert('Proposal created successfully!');
    document.getElementById('create-modal').classList.remove('active');
    document.getElementById('create-proposal-form').reset();
    await loadProposals();
  } catch (error) {
    console.error('Error creating proposal:', error);
    alert('Failed to create proposal. Please try again.');
  }
}
