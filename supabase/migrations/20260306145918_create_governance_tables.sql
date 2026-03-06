/*
  # PizzaDAO Governance System Schema

  ## Overview
  Creates the database schema for PizzaDAO's onchain governance proposal system using Agora.
  
  ## New Tables
  
  ### `proposals`
  Stores governance proposals submitted by PizzaDAO members
  - `id` (uuid, primary key) - Unique proposal identifier
  - `title` (text) - Proposal title
  - `description` (text) - Full proposal description
  - `image_url` (text, optional) - Supporting image URL
  - `proposer_address` (text) - Ethereum address of proposer
  - `status` (text) - Current status: 'active', 'passed', 'rejected', 'pending'
  - `funding_amount` (numeric) - Requested funding in USD
  - `vote_threshold` (integer) - Required votes based on funding amount
  - `start_date` (timestamptz) - Voting start date
  - `end_date` (timestamptz) - Voting end date (7 days after start)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ### `votes`
  Records individual votes on proposals
  - `id` (uuid, primary key) - Unique vote identifier
  - `proposal_id` (uuid, foreign key) - Reference to proposal
  - `voter_address` (text) - Ethereum address of voter
  - `vote_type` (text) - Vote choice: 'aye', 'nay', 'abstain'
  - `is_anonymous` (boolean) - Whether vote is anonymous
  - `voted_at` (timestamptz) - Vote timestamp
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies for authenticated users to read proposals
  - Policies for proposal creation and voting
  - Unique constraint on votes to prevent double voting
*/

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text,
  proposer_address text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  funding_amount numeric DEFAULT 0,
  vote_threshold integer NOT NULL,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'passed', 'rejected'))
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  voter_address text NOT NULL,
  vote_type text NOT NULL,
  is_anonymous boolean DEFAULT false,
  voted_at timestamptz DEFAULT now(),
  CONSTRAINT valid_vote_type CHECK (vote_type IN ('aye', 'nay', 'abstain')),
  CONSTRAINT unique_vote UNIQUE (proposal_id, voter_address)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_address ON votes(voter_address);

-- Enable Row Level Security
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Proposals policies
CREATE POLICY "Anyone can view proposals"
  ON proposals FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Proposal creators can update their proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (proposer_address = auth.jwt()->>'wallet_address')
  WITH CHECK (proposer_address = auth.jwt()->>'wallet_address');

-- Votes policies
CREATE POLICY "Anyone can view non-anonymous votes"
  ON votes FOR SELECT
  TO anon, authenticated
  USING (is_anonymous = false OR voter_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Authenticated users can vote"
  ON votes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to update proposal status based on votes
CREATE OR REPLACE FUNCTION update_proposal_status()
RETURNS trigger AS $$
BEGIN
  UPDATE proposals
  SET 
    status = CASE
      WHEN end_date < now() THEN
        CASE
          WHEN (SELECT COUNT(*) FILTER (WHERE vote_type = 'aye') FROM votes WHERE proposal_id = NEW.proposal_id) >
               (SELECT COUNT(*) FILTER (WHERE vote_type = 'nay') FROM votes WHERE proposal_id = NEW.proposal_id)
          AND (SELECT COUNT(*) FILTER (WHERE vote_type IN ('aye', 'abstain')) FROM votes WHERE proposal_id = NEW.proposal_id) >= 
              (SELECT vote_threshold FROM proposals WHERE id = NEW.proposal_id)
          THEN 'passed'
          ELSE 'rejected'
        END
      ELSE status
    END,
    updated_at = now()
  WHERE id = NEW.proposal_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update proposal status after votes
CREATE TRIGGER on_vote_update_proposal_status
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_status();
