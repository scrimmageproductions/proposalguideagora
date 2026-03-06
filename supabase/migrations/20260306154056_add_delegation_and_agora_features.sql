/*
  # Add Agora-Inspired Governance Features

  ## Overview
  Extends PizzaDAO governance with delegation, delegate profiles, vote reasons, and proposal discussions.

  ## New Tables

  ### `delegations`
  Tracks voting power delegation between members
  - `id` (uuid, primary key) - Unique delegation identifier
  - `delegator_address` (text) - Address delegating voting power
  - `delegate_address` (text) - Address receiving voting power
  - `is_active` (boolean) - Whether delegation is currently active
  - `created_at` (timestamptz) - Delegation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `delegate_profiles`
  Stores information about delegates
  - `id` (uuid, primary key) - Unique profile identifier
  - `delegate_address` (text, unique) - Delegate's Ethereum address
  - `name` (text) - Display name
  - `bio` (text) - Delegate statement/biography
  - `avatar_url` (text) - Profile image URL
  - `twitter` (text) - Twitter handle
  - `discord` (text) - Discord username
  - `voting_power` (integer) - Current voting power (cached)
  - `proposals_voted` (integer) - Total proposals voted on
  - `created_at` (timestamptz) - Profile creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `vote_reasons`
  Allows voters to explain their vote choices
  - `id` (uuid, primary key) - Unique reason identifier
  - `vote_id` (uuid, foreign key) - Reference to vote
  - `voter_address` (text) - Voter's address
  - `reason` (text) - Explanation for vote
  - `created_at` (timestamptz) - Reason creation timestamp

  ### `proposal_comments`
  Discussion threads on proposals
  - `id` (uuid, primary key) - Unique comment identifier
  - `proposal_id` (uuid, foreign key) - Reference to proposal
  - `commenter_address` (text) - Commenter's address
  - `comment` (text) - Comment text
  - `parent_comment_id` (uuid, nullable) - For threaded replies
  - `created_at` (timestamptz) - Comment creation timestamp

  ## Security
  - RLS enabled on all tables
  - Policies for authenticated users to manage their data
  - Public read access for transparency
*/

-- Create delegations table
CREATE TABLE IF NOT EXISTS delegations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegator_address text NOT NULL,
  delegate_address text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_active_delegation UNIQUE (delegator_address, is_active)
);

-- Create delegate profiles table
CREATE TABLE IF NOT EXISTS delegate_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_address text UNIQUE NOT NULL,
  name text,
  bio text,
  avatar_url text,
  twitter text,
  discord text,
  voting_power integer DEFAULT 0,
  proposals_voted integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create vote reasons table
CREATE TABLE IF NOT EXISTS vote_reasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vote_id uuid NOT NULL REFERENCES votes(id) ON DELETE CASCADE,
  voter_address text NOT NULL,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_vote_reason UNIQUE (vote_id)
);

-- Create proposal comments table
CREATE TABLE IF NOT EXISTS proposal_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  commenter_address text NOT NULL,
  comment text NOT NULL,
  parent_comment_id uuid REFERENCES proposal_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_delegations_delegator ON delegations(delegator_address);
CREATE INDEX IF NOT EXISTS idx_delegations_delegate ON delegations(delegate_address);
CREATE INDEX IF NOT EXISTS idx_delegations_active ON delegations(is_active);
CREATE INDEX IF NOT EXISTS idx_delegate_profiles_address ON delegate_profiles(delegate_address);
CREATE INDEX IF NOT EXISTS idx_vote_reasons_vote_id ON vote_reasons(vote_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_proposal_id ON proposal_comments(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_comments_parent ON proposal_comments(parent_comment_id);

-- Enable RLS
ALTER TABLE delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE delegate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vote_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_comments ENABLE ROW LEVEL SECURITY;

-- Delegation policies
CREATE POLICY "Anyone can view active delegations"
  ON delegations FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Users can create their own delegations"
  ON delegations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own delegations"
  ON delegations FOR UPDATE
  TO authenticated
  USING (delegator_address = auth.jwt()->>'wallet_address')
  WITH CHECK (delegator_address = auth.jwt()->>'wallet_address');

-- Delegate profile policies
CREATE POLICY "Anyone can view delegate profiles"
  ON delegate_profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Delegates can create their own profiles"
  ON delegate_profiles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Delegates can update their own profiles"
  ON delegate_profiles FOR UPDATE
  TO authenticated
  USING (delegate_address = auth.jwt()->>'wallet_address')
  WITH CHECK (delegate_address = auth.jwt()->>'wallet_address');

-- Vote reason policies
CREATE POLICY "Anyone can view vote reasons"
  ON vote_reasons FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Voters can add reasons to their votes"
  ON vote_reasons FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Proposal comment policies
CREATE POLICY "Anyone can view proposal comments"
  ON proposal_comments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON proposal_comments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON proposal_comments FOR UPDATE
  TO authenticated
  USING (commenter_address = auth.jwt()->>'wallet_address')
  WITH CHECK (commenter_address = auth.jwt()->>'wallet_address');

CREATE POLICY "Users can delete their own comments"
  ON proposal_comments FOR DELETE
  TO authenticated
  USING (commenter_address = auth.jwt()->>'wallet_address');

-- Function to update delegate voting power
CREATE OR REPLACE FUNCTION update_delegate_voting_power()
RETURNS void AS $$
BEGIN
  UPDATE delegate_profiles
  SET voting_power = COALESCE(
    (SELECT COUNT(*) FROM delegations 
     WHERE delegate_address = delegate_profiles.delegate_address 
     AND is_active = true),
    0
  ) + 1;
END;
$$ LANGUAGE plpgsql;

-- Function to update delegate proposals voted count
CREATE OR REPLACE FUNCTION increment_delegate_proposals_voted()
RETURNS trigger AS $$
BEGIN
  UPDATE delegate_profiles
  SET proposals_voted = proposals_voted + 1
  WHERE delegate_address = NEW.voter_address;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update proposals voted count
CREATE TRIGGER on_vote_update_delegate_stats
  AFTER INSERT ON votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_delegate_proposals_voted();
