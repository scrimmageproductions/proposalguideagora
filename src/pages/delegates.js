import { getWalletInfo } from '../wallet.js';
import { supabase } from '../supabase.js';

export async function renderDelegatesPage(container) {
  container.innerHTML = `
    <div class="container">
      <h1 class="page-title">Delegates</h1>

      <div style="max-width: 800px; margin: 0 auto 32px; background: white; padding: 24px; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="margin-bottom: 16px; font-size: 24px; font-weight: 900;">Delegation</h2>
        <p style="margin-bottom: 16px; line-height: 1.6; color: #333;">
          Delegate your voting power to a trusted community member. They can vote on your behalf while you retain ownership of your tokens.
        </p>
        <div id="delegation-status" style="margin-bottom: 16px;"></div>
        <div id="delegation-controls"></div>
      </div>

      <div style="max-width: 1200px; margin: 0 auto;">
        <h2 style="color: white; font-size: 32px; font-weight: 900; margin-bottom: 24px; text-align: center;">Top Delegates</h2>
        <div id="delegates-list" class="proposals-grid">
          <p style="color: white; text-align: center; width: 100%;">Loading delegates...</p>
        </div>
      </div>
    </div>

    <div class="modal-overlay" id="delegate-modal">
      <div class="modal-content">
        <button class="modal-close" id="close-delegate-modal">&times;</button>
        <div id="delegate-modal-body"></div>
      </div>
    </div>

    <div class="modal-overlay" id="profile-edit-modal">
      <div class="modal-content">
        <button class="modal-close" id="close-profile-modal">&times;</button>
        <h2 style="margin-bottom: 24px;">Edit Delegate Profile</h2>
        <form id="profile-form">
          <div class="form-group">
            <label for="delegate-name">Display Name</label>
            <input type="text" id="delegate-name" required placeholder="Your name or ENS">
          </div>
          <div class="form-group">
            <label for="delegate-bio">Delegate Statement</label>
            <textarea id="delegate-bio" required placeholder="Why should people delegate to you? What are your values and priorities for PizzaDAO?"></textarea>
          </div>
          <div class="form-group">
            <label for="delegate-avatar">Avatar URL</label>
            <input type="url" id="delegate-avatar" placeholder="https://...">
          </div>
          <div class="form-group">
            <label for="delegate-twitter">Twitter Handle</label>
            <input type="text" id="delegate-twitter" placeholder="@yourhandle">
          </div>
          <div class="form-group">
            <label for="delegate-discord">Discord Username</label>
            <input type="text" id="delegate-discord" placeholder="username#1234">
          </div>
          <button type="submit" class="btn-primary" style="width: 100%; margin-top: 16px;">Save Profile</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('close-delegate-modal').addEventListener('click', () => {
    document.getElementById('delegate-modal').classList.remove('active');
  });

  document.getElementById('close-profile-modal').addEventListener('click', () => {
    document.getElementById('profile-edit-modal').classList.remove('active');
  });

  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveProfile();
  });

  await loadDelegationStatus();
  await loadDelegates();
}

async function loadDelegationStatus() {
  const wallet = getWalletInfo();
  const statusContainer = document.getElementById('delegation-status');
  const controlsContainer = document.getElementById('delegation-controls');

  if (!wallet.isConnected) {
    statusContainer.innerHTML = '<p style="color: #666;">Connect your wallet to delegate your voting power.</p>';
    controlsContainer.innerHTML = '';
    return;
  }

  const { data: currentDelegation } = await supabase
    .from('delegations')
    .select('*, delegate_profiles(name, delegate_address)')
    .eq('delegator_address', wallet.userAddress)
    .eq('is_active', true)
    .maybeSingle();

  if (currentDelegation) {
    const delegateName = currentDelegation.delegate_profiles?.name ||
                         `${currentDelegation.delegate_address.slice(0, 6)}...${currentDelegation.delegate_address.slice(-4)}`;

    statusContainer.innerHTML = `
      <div style="background: #e8f5e9; padding: 16px; border-radius: 8px; border-left: 4px solid #4CAF50;">
        <p style="color: #2e7d32; font-weight: 800; margin-bottom: 8px;">Currently delegating to:</p>
        <p style="color: #1b5e20; font-size: 18px;">${delegateName}</p>
      </div>
    `;

    controlsContainer.innerHTML = `
      <button class="btn-secondary" id="revoke-delegation-btn" style="width: 100%;">Revoke Delegation</button>
    `;

    document.getElementById('revoke-delegation-btn').addEventListener('click', async () => {
      await handleRevokeDelegation(currentDelegation.id);
    });
  } else {
    statusContainer.innerHTML = `
      <div style="background: #fff3e0; padding: 16px; border-radius: 8px; border-left: 4px solid #FF9800;">
        <p style="color: #e65100;">You are not currently delegating your voting power.</p>
      </div>
    `;

    controlsContainer.innerHTML = `
      <button class="btn-primary" id="setup-profile-btn" style="width: 100%; margin-bottom: 8px;">
        Become a Delegate
      </button>
    `;

    document.getElementById('setup-profile-btn').addEventListener('click', () => {
      document.getElementById('profile-edit-modal').classList.add('active');
      loadProfileForm();
    });
  }
}

async function loadDelegates() {
  try {
    const { data: delegates, error } = await supabase
      .from('delegate_profiles')
      .select('*')
      .order('voting_power', { ascending: false })
      .limit(20);

    if (error) throw error;

    const delegatesContainer = document.getElementById('delegates-list');

    if (!delegates || delegates.length === 0) {
      delegatesContainer.innerHTML = '<p style="color: white; text-align: center; width: 100%;">No delegates yet. Be the first!</p>';
      return;
    }

    delegatesContainer.innerHTML = delegates.map((delegate, index) => `
      <div class="proposal-card" data-delegate-address="${delegate.delegate_address}" style="cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
          <div style="position: relative;">
            ${delegate.avatar_url
              ? `<img src="${delegate.avatar_url}" alt="${delegate.name}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover;">`
              : `<div style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 24px;">${delegate.name?.[0]?.toUpperCase() || '?'}</div>`
            }
            ${index < 3 ? `<div style="position: absolute; bottom: -4px; right: -4px; width: 24px; height: 24px; background: ${index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 12px; border: 2px solid white;">${index + 1}</div>` : ''}
          </div>
          <div style="flex: 1;">
            <h3 style="font-size: 20px; font-weight: 900; margin-bottom: 4px;">${delegate.name || 'Anonymous Delegate'}</h3>
            <p style="font-size: 12px; color: #666;">${delegate.delegate_address.slice(0, 6)}...${delegate.delegate_address.slice(-4)}</p>
          </div>
        </div>

        <p style="color: #333; line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${delegate.bio || 'No statement provided'}
        </p>

        <div style="display: flex; gap: 16px; padding-top: 12px; border-top: 1px solid #eee;">
          <div style="flex: 1;">
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">Voting Power</p>
            <p style="font-size: 20px; font-weight: 900; color: #4CAF50;">${delegate.voting_power}</p>
          </div>
          <div style="flex: 1;">
            <p style="font-size: 12px; color: #666; margin-bottom: 4px;">Proposals Voted</p>
            <p style="font-size: 20px; font-weight: 900; color: #2196F3;">${delegate.proposals_voted}</p>
          </div>
        </div>

        ${delegate.twitter || delegate.discord ? `
          <div style="display: flex; gap: 8px; margin-top: 12px;">
            ${delegate.twitter ? `<span style="background: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 800;">${delegate.twitter}</span>` : ''}
            ${delegate.discord ? `<span style="background: #ede7f6; color: #5e35b1; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 800;">${delegate.discord}</span>` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');

    document.querySelectorAll('.proposal-card').forEach(card => {
      card.addEventListener('click', async () => {
        const address = card.getAttribute('data-delegate-address');
        await showDelegateDetail(address, delegates);
      });
    });

  } catch (error) {
    console.error('Error loading delegates:', error);
  }
}

async function showDelegateDetail(address, delegates) {
  const delegate = delegates.find(d => d.delegate_address === address);
  if (!delegate) return;

  const wallet = getWalletInfo();
  const isOwnProfile = wallet.isConnected && wallet.userAddress.toLowerCase() === address.toLowerCase();

  const { data: delegations } = await supabase
    .from('delegations')
    .select('delegator_address')
    .eq('delegate_address', address)
    .eq('is_active', true);

  const modalBody = document.getElementById('delegate-modal-body');
  modalBody.innerHTML = `
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
      ${delegate.avatar_url
        ? `<img src="${delegate.avatar_url}" alt="${delegate.name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">`
        : `<div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 32px;">${delegate.name?.[0]?.toUpperCase() || '?'}</div>`
      }
      <div>
        <h2 style="margin-bottom: 8px;">${delegate.name || 'Anonymous Delegate'}</h2>
        <p style="color: #666; font-size: 14px;">${delegate.delegate_address}</p>
      </div>
    </div>

    <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
      <h3 style="margin-bottom: 12px;">Delegate Statement</h3>
      <p style="line-height: 1.6; white-space: pre-wrap;">${delegate.bio || 'No statement provided'}</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
      <div style="background: #e8f5e9; padding: 16px; border-radius: 8px;">
        <p style="font-size: 14px; color: #2e7d32; margin-bottom: 4px;">Voting Power</p>
        <p style="font-size: 32px; font-weight: 900; color: #1b5e20;">${delegate.voting_power}</p>
      </div>
      <div style="background: #e3f2fd; padding: 16px; border-radius: 8px;">
        <p style="font-size: 14px; color: #1565c0; margin-bottom: 4px;">Proposals Voted</p>
        <p style="font-size: 32px; font-weight: 900; color: #0d47a1;">${delegate.proposals_voted}</p>
      </div>
    </div>

    ${delegate.twitter || delegate.discord ? `
      <div style="margin-bottom: 24px;">
        <h3 style="margin-bottom: 12px;">Contact</h3>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${delegate.twitter ? `<span style="background: #e3f2fd; color: #1976d2; padding: 8px 16px; border-radius: 12px; font-weight: 800;">${delegate.twitter}</span>` : ''}
          ${delegate.discord ? `<span style="background: #ede7f6; color: #5e35b1; padding: 8px 16px; border-radius: 12px; font-weight: 800;">${delegate.discord}</span>` : ''}
        </div>
      </div>
    ` : ''}

    ${isOwnProfile ? `
      <button class="btn-secondary" id="edit-profile-btn" style="width: 100%; margin-bottom: 16px;">
        Edit Profile
      </button>
    ` : wallet.isConnected ? `
      <button class="btn-primary" id="delegate-to-btn" style="width: 100%;">
        Delegate to ${delegate.name || 'this delegate'}
      </button>
    ` : `
      <p style="text-align: center; color: #666;">Connect your wallet to delegate</p>
    `}
  `;

  if (isOwnProfile) {
    document.getElementById('edit-profile-btn').addEventListener('click', () => {
      document.getElementById('delegate-modal').classList.remove('active');
      document.getElementById('profile-edit-modal').classList.add('active');
      loadProfileForm(delegate);
    });
  } else if (wallet.isConnected) {
    document.getElementById('delegate-to-btn').addEventListener('click', async () => {
      await handleDelegate(address);
    });
  }

  document.getElementById('delegate-modal').classList.add('active');
}

async function handleDelegate(delegateAddress) {
  const wallet = getWalletInfo();

  if (!wallet.isConnected) {
    alert('Please connect your wallet to delegate.');
    return;
  }

  if (wallet.userAddress.toLowerCase() === delegateAddress.toLowerCase()) {
    alert('You cannot delegate to yourself.');
    return;
  }

  try {
    const { data: existing } = await supabase
      .from('delegations')
      .select('*')
      .eq('delegator_address', wallet.userAddress)
      .eq('is_active', true)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('delegations')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    }

    const { error } = await supabase
      .from('delegations')
      .insert({
        delegator_address: wallet.userAddress,
        delegate_address: delegateAddress,
        is_active: true
      });

    if (error) throw error;

    await supabase.rpc('update_delegate_voting_power');

    alert('Successfully delegated your voting power!');
    document.getElementById('delegate-modal').classList.remove('active');
    await loadDelegationStatus();
    await loadDelegates();
  } catch (error) {
    console.error('Error delegating:', error);
    alert('Failed to delegate. Please try again.');
  }
}

async function handleRevokeDelegation(delegationId) {
  if (!confirm('Are you sure you want to revoke your delegation?')) return;

  try {
    const { error } = await supabase
      .from('delegations')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', delegationId);

    if (error) throw error;

    await supabase.rpc('update_delegate_voting_power');

    alert('Delegation revoked successfully!');
    await loadDelegationStatus();
    await loadDelegates();
  } catch (error) {
    console.error('Error revoking delegation:', error);
    alert('Failed to revoke delegation. Please try again.');
  }
}

async function loadProfileForm(existingProfile = null) {
  if (existingProfile) {
    document.getElementById('delegate-name').value = existingProfile.name || '';
    document.getElementById('delegate-bio').value = existingProfile.bio || '';
    document.getElementById('delegate-avatar').value = existingProfile.avatar_url || '';
    document.getElementById('delegate-twitter').value = existingProfile.twitter || '';
    document.getElementById('delegate-discord').value = existingProfile.discord || '';
  } else {
    const wallet = getWalletInfo();
    const { data: profile } = await supabase
      .from('delegate_profiles')
      .select('*')
      .eq('delegate_address', wallet.userAddress)
      .maybeSingle();

    if (profile) {
      document.getElementById('delegate-name').value = profile.name || '';
      document.getElementById('delegate-bio').value = profile.bio || '';
      document.getElementById('delegate-avatar').value = profile.avatar_url || '';
      document.getElementById('delegate-twitter').value = profile.twitter || '';
      document.getElementById('delegate-discord').value = profile.discord || '';
    }
  }
}

async function handleSaveProfile() {
  const wallet = getWalletInfo();

  if (!wallet.isConnected) {
    alert('Please connect your wallet.');
    return;
  }

  const profileData = {
    delegate_address: wallet.userAddress,
    name: document.getElementById('delegate-name').value,
    bio: document.getElementById('delegate-bio').value,
    avatar_url: document.getElementById('delegate-avatar').value || null,
    twitter: document.getElementById('delegate-twitter').value || null,
    discord: document.getElementById('delegate-discord').value || null,
    updated_at: new Date().toISOString()
  };

  try {
    const { data: existing } = await supabase
      .from('delegate_profiles')
      .select('*')
      .eq('delegate_address', wallet.userAddress)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('delegate_profiles')
        .update(profileData)
        .eq('delegate_address', wallet.userAddress);

      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('delegate_profiles')
        .insert(profileData);

      if (error) throw error;
    }

    alert('Profile saved successfully!');
    document.getElementById('profile-edit-modal').classList.remove('active');
    document.getElementById('profile-form').reset();
    await loadDelegates();
    await loadDelegationStatus();
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Failed to save profile. Please try again.');
  }
}
