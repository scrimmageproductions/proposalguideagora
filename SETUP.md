# Setup Guide

## Getting a WalletConnect Project ID

PizzaDAO Governance uses WalletConnect AppKit to support 300+ cryptocurrency wallets. To enable wallet connections, you need a free WalletConnect Project ID.

### Steps:

1. **Visit WalletConnect Cloud**
   - Go to [https://cloud.walletconnect.com](https://cloud.walletconnect.com)
   - Sign up or log in with your account

2. **Create a New Project**
   - Click "Create New Project"
   - Enter project name: `PizzaDAO Governance`
   - Select "AppKit" as the project type
   - Click "Create"

3. **Get Your Project ID**
   - Once created, you'll see your Project ID on the dashboard
   - Copy the Project ID (it looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

4. **Add to Environment Variables**
   - Open the `.env` file in your project root
   - Add your Project ID:
     ```
     VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
     ```
   - Save the file

5. **Restart Development Server**
   ```bash
   npm run dev
   ```

## Supported Wallets

With WalletConnect AppKit, users can connect with:

- **Browser Extensions**: MetaMask, Coinbase Wallet, Rabby, Frame
- **Mobile Wallets**: Rainbow, Trust Wallet, Zerion, Argent
- **Hardware Wallets**: Ledger Live, Trezor Suite
- **Smart Contract Wallets**: Safe, Gnosis
- **And 300+ more wallets**

## Network Configuration

The platform is configured to support:
- **Ethereum Mainnet** - For production governance
- **Sepolia Testnet** - For testing and development

Users can switch networks directly from the wallet connection modal.

## Customization

The WalletConnect modal is styled to match PizzaDAO branding:
- Primary color: Earth Blue (#7DD3E8)
- Light theme by default
- Rounded corners (8px border radius)

To customize further, edit `src/wallet.js`:

```javascript
themeVariables: {
  '--w3m-accent': '#7DD3E8',          // Primary color
  '--w3m-border-radius-master': '8px' // Border radius
}
```

## Troubleshooting

### "Invalid Project ID" Error
- Verify your Project ID is correct in `.env`
- Make sure the variable is named `VITE_WALLETCONNECT_PROJECT_ID`
- Restart the development server after changing `.env`

### Wallet Not Connecting
- Check that you're using a supported network (Mainnet or Sepolia)
- Try refreshing the page
- Clear browser cache and try again
- Make sure your wallet app is up to date

### Modal Not Opening
- Ensure WalletConnect scripts loaded properly (check browser console)
- Verify no ad blockers are interfering with the connection
- Try a different browser

## Additional Resources

- [WalletConnect Documentation](https://docs.walletconnect.com)
- [AppKit Documentation](https://docs.reown.com/appkit/overview)
- [Supported Wallets](https://walletconnect.com/explorer)
- [PizzaDAO Discord](https://discord.pizzadao.xyz) - Get help from the community
