# PizzaDAO Governance System

A comprehensive onchain governance proposal system for PizzaDAO built with Agora, featuring animated pepperoni rain, mobile-responsive design, and PizzaDAO branding.

## Features

- **Proposal Management**: Create, view, and vote on governance proposals
- **Anonymous Voting**: All votes are anonymous by default
- **NFT-Gated**: Only PizzaDAO Box and Pizza NFT holders can create proposals
- **Vote Thresholds**: Configurable vote requirements based on funding amounts
- **7-Day Voting Period**: Standard governance timeline
- **Wallet Integration**: MetaMask wallet connection for proposal creation and voting
- **Mobile Optimized**: Fully responsive design for all devices
- **Animated Background**: Raining pepperonis from clouds
- **PizzaDAO Branding**: Uses official colors (Earth Blue #7DD3E8, Pizza Yellow #FFE135, Pizza Red #E85D5D)

## Pages

1. **Proposals**: Browse and vote on active proposals
2. **Governance Rules**: Complete guide to PizzaDAO governance standards
3. **Submit Payment**: Redirect to payment form for approved proposals

## Tech Stack

- **Frontend**: Vanilla JavaScript with Vite
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Wallet**: Ethers.js for Web3 integration
- **Styling**: Custom CSS with PizzaDAO brand kit

## Governance Rules

### Membership Requirements
- PizzaDAO NFT holders (Rare Pizza Box or Rare Pizza NFT)
- Non-holders may request sponsorship

### Voting Structure
- **Vote Types**: Aye, Nay, Abstain
- **Voting Period**: 7 days
- **Method**: One vote per member
- **Anonymous**: Yes

### Passage Requirements
- Ayes must exceed Nays
- Ayes + Abstains must meet funding threshold

### Funding Thresholds
- ≤ $625: 15 votes required
- $625–$2,500: 25 votes required
- > $2,500: 35 votes required

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Database Schema

### Proposals Table
- Stores all governance proposals
- Tracks status (pending, active, passed, rejected)
- Includes funding amount and vote threshold

### Votes Table
- Records individual votes
- Supports anonymous voting
- Prevents double voting with unique constraints

## Security

- Row Level Security (RLS) enabled on all tables
- Anonymous voting by default
- Wallet signature verification for proposal creation
- Vote integrity through database constraints

Pizza the Planet!
