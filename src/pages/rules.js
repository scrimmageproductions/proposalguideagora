export function renderRulesPage(container) {
  container.innerHTML = `
    <div class="container">
      <h1 class="page-title">PizzaDAO Governance Rules</h1>
      <div class="rules-content">

        <div class="rules-section">
          <h2>Membership Requirements</h2>
          <ul>
            <li>Only PizzaDAO NFT holders can submit proposals</li>
            <li>Members must own either a Rare Pizza Box or Rare Pizza NFT</li>
            <li>Non-holders may request sponsorship from an existing member</li>
          </ul>
        </div>

        <div class="rules-section">
          <h2>Proposal Submission Process</h2>
          <ol>
            <li>Claim Discord role via #collabland-join channel</li>
            <li>Connect wallet to verify NFT ownership</li>
            <li>Use the PizzaDAO Poll Creator tool or this platform</li>
            <li>Fill proposal with title, description, and supporting image</li>
            <li>Optional: Submit to governance crew for pre-review</li>
          </ol>
        </div>

        <div class="rules-section">
          <h2>Voting Structure</h2>
          <div class="highlight-box">
            <p><strong>Vote Types:</strong> Aye, Nay, Abstain</p>
            <p><strong>Voting Period:</strong> 7 days</p>
            <p><strong>Voting Method:</strong> One vote per PizzaDAO member</p>
            <p><strong>Voter Eligibility:</strong> Limited to Box Mafia and Pizza Mafia role holders</p>
            <p><strong>Anonymous Voting:</strong> All votes on this platform are anonymous by default</p>
          </div>
        </div>

        <div class="rules-section">
          <h2>Passage Requirements</h2>
          <p>A proposal passes when:</p>
          <ul>
            <li>Ayes exceed Nays</li>
            <li>Combined Ayes + Abstains meet the threshold for the dollar amount requested</li>
          </ul>
        </div>

        <div class="rules-section">
          <h2>Funding Thresholds</h2>
          <p>Vote requirements based on proposal budget:</p>
          <table class="threshold-table">
            <thead>
              <tr>
                <th>Funding Amount</th>
                <th>Required Votes (Ayes + Abstains)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>≤ $625</td>
                <td>15 votes</td>
              </tr>
              <tr>
                <td>$625 – $2,500</td>
                <td>25 votes</td>
              </tr>
              <tr>
                <td>> $2,500</td>
                <td>35 votes</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rules-section">
          <h2>Post-Approval</h2>
          <ul>
            <li>Winners submit payment requests via the payments page</li>
            <li>Standard processing occurs within 7 days</li>
            <li>Submissions 14+ days before event ensure timely delivery</li>
            <li>Urgent requests may experience delays</li>
          </ul>
        </div>

        <div class="rules-section">
          <h2>Best Practices</h2>
          <h3>Engage the Community</h3>
          <p>Participate in the PizzaDAO Discord to establish yourself within the pizza mafia. Join community calls on Sundays at 1pm EST and crew calls throughout the week.</p>

          <h3>Network and Build Relationships</h3>
          <p>Establish connections with other PizzaDAO members who share common interests. Building a network within the community can lead to increased support for your proposal.</p>

          <h3>Build a Strong Case</h3>
          <p>Clearly explain how your proposal aligns with PizzaDAO's mission and benefits the community. Use compelling language and visuals to make your case stand out.</p>

          <h3>Answer Questions</h3>
          <p>Be responsive to community members' questions and concerns. Providing thorough responses can build trust and garner more votes.</p>

          <h3>Collaborate with Others</h3>
          <p>Seek endorsements or partnerships with established members or projects within PizzaDAO for credibility and more votes.</p>

          <h3>Communicate Updates</h3>
          <p>Update the community on your proposal's progress. Share achievements and milestones in general chat or in your proposal's thread.</p>

          <h3>Socialize Your Proposal</h3>
          <p>Share it strategically in relevant channels, bring it up on PizzaDAO's community calls, and ask your friends within the DAO to support you.</p>
        </div>

        <div class="highlight-box" style="margin-top: 32px;">
          <p style="text-align: center; font-size: 18px; font-weight: 800; margin: 0;">
            Pizza the Planet
          </p>
        </div>

      </div>
    </div>
  `;
}
