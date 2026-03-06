export function renderPaymentsPage(container) {
  container.innerHTML = `
    <div class="container">
      <h1 class="page-title">Submit Payment Request</h1>
      <div class="payment-content">
        <div class="payment-redirect">
          <h2>Congratulations on Your Passed Proposal!</h2>
          <p>If your proposal has been approved by the PizzaDAO community, you can now submit your payment request through our official payment form.</p>

          <p>Please have the following information ready:</p>
          <ul style="text-align: left; max-width: 500px; margin: 24px auto;">
            <li>Your proposal title and details</li>
            <li>Approved funding amount</li>
            <li>Payment wallet address</li>
            <li>Any required invoices or receipts</li>
          </ul>

          <div class="highlight-box" style="margin: 32px 0;">
            <p><strong>Processing Time:</strong> Payments are typically processed within 7 days</p>
            <p><strong>Important:</strong> Submit at least 14 days before your event for timely delivery</p>
            <p style="margin: 0;"><strong>Note:</strong> Urgent requests may experience delays</p>
          </div>

          <a href="https://forms.gle/8UMXZ8WmL4Nk4DLA8" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
            Go to Payment Form
          </a>

          <p style="margin-top: 32px; font-size: 14px; color: #666;">
            This will redirect you to the official PizzaDAO payment submission form
          </p>
        </div>
      </div>
    </div>
  `;
}
