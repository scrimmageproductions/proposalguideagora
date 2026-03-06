# PizzaDAO Governance Platform

A comprehensive onchain governance system for PizzaDAO powered by Agora-inspired features, with animated pepperoni rain, mobile-responsive design, and full PizzaDAO branding.

## Features

### Core Governance
- **Proposal Management**: Create, view, and vote on governance proposals
- **Anonymous Voting**: All votes are anonymous by default for privacy
- **NFT-Gated**: Only PizzaDAO Box and Pizza NFT holders can create proposals
- **Vote Thresholds**: Configurable requirements based on funding amounts (15/25/35 votes)
- **7-Day Voting Period**: Standard governance timeline with automatic status updates
- **Multi-Wallet Support**: Connect with 300+ wallets via WalletConnect including MetaMask, Rainbow, Coinbase Wallet, Trust Wallet, and more

### Delegation System (Agora-Inspired)
- **Delegate Your Voting Power**: Entrust your vote to trusted community members
- **Delegate Profiles**: Complete profiles with statements, avatars, and social links
- **Delegate Leaderboard**: Rankings by voting power and participation
- **Participation Metrics**: Track proposals voted on and delegation counts
- **Profile Management**: Delegates can create and edit their own profiles
- **Revoke Anytime**: Maintain control by revoking delegations whenever needed

### Discussion & Transparency
- **Proposal Comments**: Engage in discussions directly on proposals
- **Vote Reasons**: Explain your voting decisions publicly
- **Real-time Updates**: Live vote counts and comment threads
- **Community Engagement**: See what others think and why they voted
- **Vote Visibility**: Public vote counts with anonymous voter identities

### Design & UX
- **Mobile Optimized**: Fully responsive design for all devices
- **Animated Background**: Raining pepperonis from animated clouds
- **PizzaDAO Branding**: Official colors (Earth Blue #7DD3E8, Pizza Yellow #FFE135, Pizza Red #E85D5D)
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Clean Interface**: Modern card-based layout with intuitive navigation

## Pages

1. **Proposals**: Browse, create, and vote on active proposals with discussion threads
2. **Delegates**: View delegate leaderboard, delegate voting power, and manage delegate profiles
3. **Governance Rules**: Complete guide to PizzaDAO governance standards and procedures
4. **Submit Payment**: Redirect to payment form for approved proposals

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6 modules with Vite build tool
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Blockchain**: Ethereum via Ethers.js v6
- **Wallet**: WalletConnect AppKit with support for 300+ wallets
- **Styling**: Custom CSS with CSS variables and modern layouts

## Agora-Inspired Features

This platform integrates key features from the [Agora governance ecosystem](https://github.com/voteagora):

### From agora-next
- **Delegation System**: Token holders delegate voting power to representatives
- **Delegate Profiles**: Verified profiles with statements, avatars, and social links
- **Profile Management**: Self-service profile creation and editing
- **Participation Tracking**: Metrics on voting activity and delegation counts

### From optimism-governor
- **Vote Reasons**: Public explanations for vote choices
- **Discussion Threads**: Community engagement on proposals
- **Transparent Governance**: All votes and comments publicly visible
- **Flexible Voting**: Support for Aye/Nay/Abstain vote types

## Database Schema

### Core Tables
- **proposals**: Governance proposals with status tracking
- **votes**: Individual votes with anonymous voter option
- **delegations**: Voting power delegation records
- **delegate_profiles**: Delegate information and statistics
- **vote_reasons**: Explanations for vote choices
- **proposal_comments**: Discussion threads on proposals

### Security Features
- Row Level Security (RLS) enabled on all tables
- Anonymous voting with optional public reasons
- Unique vote constraints to prevent double voting
- Wallet-based authentication for all actions
- Automatic vote counting and status updates

## Governance Rules

### Membership Requirements
- PizzaDAO NFT holders (Rare Pizza Box or Rare Pizza NFT)
- Non-holders may request proposal sponsorship from holders
- Delegation allows participation without direct NFT ownership

### Voting Structure
- **Vote Types**: Aye, Nay, Abstain
- **Voting Period**: 7 days from proposal start
- **Method**: One vote per member (or via delegation)
- **Privacy**: Anonymous by default with optional public reasons

### Passage Requirements
- Ayes must exceed Nays
- Ayes + Abstains must meet the funding threshold
- Status automatically updates when voting period ends

### Funding Thresholds
- **≤ $625**: 15 votes required (Ayes + Abstains)
- **$625–$2,500**: 25 votes required
- **> $2,500**: 35 votes required

## Setup

1. **Get a WalletConnect Project ID**
   - Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
   - Create a new project
   - Copy your Project ID

2. **Configure Environment Variables**
   ```bash
   # Add to .env file
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

3. **Install & Run**
   ```bash
   # Install dependencies
   npm install

   # Run development server
   npm run dev

   # Build for production
   npm run build

   # Preview production build
   npm run preview
   ```

## Project Structure

```
src/
├── pages/
│   ├── proposals.js      # Proposals listing and voting
│   ├── delegates.js      # Delegation and delegate profiles
│   ├── rules.js          # Governance documentation
│   └── payments.js       # Payment submission redirect
├── wallet.js             # Web3 wallet integration
├── router.js             # Client-side routing
├── pepperoniRain.js      # Animated background effect
├── supabase.js           # Database client
├── styles.css            # Global styles
└── main.js               # Application entry point
```

## Key Features Implementation

### Delegation Flow
1. User connects wallet
2. Browse delegate profiles with stats
3. Delegate voting power to chosen delegate
4. Delegate can vote on user's behalf
5. User can revoke delegation anytime

### Voting Flow
1. User connects wallet
2. Views proposal details and discussion
3. Votes Aye/Nay/Abstain with optional reason
4. Vote is recorded anonymously
5. Vote reason appears publicly (if provided)
6. Comment on proposal for discussion

### Delegate Profile Creation
1. Connect wallet
2. Click "Become a Delegate"
3. Fill out profile (name, bio, avatar, socials)
4. Profile appears in delegate leaderboard
5. Voting power automatically tracked

## Security & Privacy

- **RLS Policies**: Enforce data access rules at database level
- **Anonymous Voting**: Voter addresses not publicly linked to votes
- **Wallet Verification**: All actions require connected wallet
- **No Double Voting**: Database constraints prevent duplicate votes
- **Optional Transparency**: Users choose to share vote reasons

## Contributing

PizzaDAO members can contribute by:
1. Creating proposals for platform improvements
2. Participating in governance votes
3. Becoming a delegate to represent the community
4. Engaging in proposal discussions and providing feedback
5. Sharing vote reasons to improve transparency

## Resources

- [PizzaDAO Brand Kit](https://pizzadao.github.io/pizzadao-brand-kit/)
- [Agora Governance](https://github.com/voteagora)
- [PizzaDAO Discord](https://discord.pizzadao.xyz)

Pizza the Planet!
