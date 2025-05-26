# 🌙 Somnia Daily Check-in Bot

A beautiful and automated daily check-in bot for Somnia Network that helps you maintain your daily streaks and earn points effortlessly.

## ✨ Features

- 🕐 **Automatic Scheduling**: Daily check-ins at 01:00 UTC / 08:00 WIB
- 📊 **Statistics tracking**: Success rates, streaks, and check-in history
- 💼 **Multi-wallet support**: Manage multiple wallets with custom aliases
- 🎨 **Beautiful interface**: Colorful console output with emojis and progress indicators
- ⏰ **Live countdown**: Real-time countdown to next check-in
- 🔄 **Auto-retry**: Intelligent retry mechanism for failed requests
- 💾 **Persistent storage**: Saves wallet configs and history in `.env`
- 🛡️ **Error handling**: Robust error handling with detailed logging

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager
- Somnia Network account with bearer tokens

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zidanaetrna/somnia-daily.git
   cd somnia-checkin-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   touch .env
   ```

4. **Start the bot**
   ```bash
   npm start
   ```

### First Run Setup

When you first run the bot, it will guide you through the setup process:

1. **Add your wallets**: Enter private keys and bearer tokens
2. **Set aliases** (optional): Give your wallets memorable names
3. **Automatic check-in**: The bot will perform initial check-ins
4. **Continuous operation**: Bot runs 24/7 with scheduled check-ins

## 📋 Usage

### Adding Wallets

The bot will detect existing wallets and ask if you want to add more:

```
💼 EXISTING WALLETS
💼 Main Wallet (0x1234...abcd)
💼 Alt Account (0x5678...efgh)

Do you want to add another wallet? (y/N): 
```

### Getting Bearer Tokens

1. Go to [Somnia Quest Network](https://quest.somnia.network/)
2. Open browser developer tools (F12)
3. Go to Network tab
4. Perform a check-in manually
5. Find the request to `/api/users/gm`
6. Copy the `Authorization` header value (without "Bearer ")

### Configuration

The bot automatically saves your configuration in `.env`:

```env
SOMNIA_WALLETS=[{"privateKey":"your_private_key","bearerToken":"your_token","walletAddress":"0x...","alias":"Main Wallet"}]
CHECKIN_HISTORY=[{"timestamp":"2025-01-01T01:00:00.000Z","success":true,"totalWallets":2,"successfulWallets":2}]
```

## 📊 Dashboard

The bot provides a beautiful dashboard with:

### Statistics Section
- Total check-ins performed
- Success rate percentage
- Last check-in timestamp
- Wallet performance tracking

### Countdown Timer
- Next check-in time in WIB timezone
- Live countdown display
- Automatic scheduling status

### Check-in Results
- Real-time progress for each wallet
- Streak counts and points earned
- Success/failure indicators with colors
- Detailed error messages if any

## 🔧 Commands

### NPM Scripts

```bash
# Start the bot
npm start

# Development mode with auto-reload
npm run dev

# Build TypeScript
npm run build

# Run linting
npm run lint
```

### Manual Operations

The bot runs automatically, but you can:

- **Stop**: Press `Ctrl+C` for graceful shutdown
- **Add wallets**: Restart the bot to add more wallets
- **View history**: Check-in history is displayed on each run

## 🛠️ Technical Details

### Architecture

```
src/
├── index.ts          # Main bot logic
├── types/            # TypeScript interfaces
├── services/         # Service classes (Somnia, etc.)
├── utils/            # Utility functions
└── config/           # Configuration management
```

### Dependencies

- **axios**: HTTP client for API requests
- **ethers**: Ethereum wallet utilities
- **dotenv**: Environment variable management
- **readline**: User input handling
- **fs/path**: File system operations

### Scheduling Logic

```typescript
// Check-in time: 01:00 UTC (08:00 WIB)
// Runs daily with automatic rescheduling
// Includes retry logic for failed attempts
```

## 🔒 Security

- Private keys are stored locally in `.env`
- No data is transmitted to external servers
- Bearer tokens are handled securely
- Input validation for all user data

## ⚠️ Disclaimers

- **Use at your own risk**: This bot interacts with Somnia Network APIs
- **Rate limiting**: Built-in delays prevent API abuse
- **Account safety**: Keep your private keys and tokens secure
- **ToS compliance**: Ensure usage complies with Somnia Network terms

## 🐛 Troubleshooting

### Common Issues

**Invalid Private Key**
```
❌ Invalid private key for wallet 1, please try again.
```
*Solution*: Ensure private key is valid hexadecimal without '0x' prefix

**Bearer Token Issues**
```
❌ Check-in error - 401 Unauthorized
```
*Solution*: Refresh your bearer token from the browser

**Network Errors**
```
❌ Check-in error - Network timeout
```
*Solution*: Check internet connection, bot will auto-retry

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=true npm start
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/zidanaetrna/somnia-daily.git

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📝 Changelog

### v1.0.0 (2025-05-27)
- Initial release
- Multi-wallet support
- Automatic scheduling
- Beautiful console interface
- Statistics tracking
- Error handling and retry logic

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Copyright (c) 2025 zidanaetrna

## 🙏 Acknowledgments

- Somnia Network for providing the quest platform
- Community members for testing and feedback
- Open source libraries that made this possible

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/somnia-checkin-bot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/somnia-checkin-bot/discussions)
- **Email**: your.email@example.com

---

**⭐ If this bot helps you maintain your Somnia streaks, please consider giving it a star!**

## 📸 Screenshots

### Bot Startup
```
╔══════════════════════════════════════════════════════════════╗
║                    🌙 SOMNIA DAILY CHECK-IN BOT 🌙           ║
╚══════════════════════════════════════════════════════════════╝

┌─ 💼 EXISTING WALLETS ──────────────────────────────────────────┐
💼 Main Wallet (0x1234...abcd)
💼 Alt Account (0x5678...efgh)
└──────────────────────────────────────────────────────────────┘
```

### Check-in Results
```
┌─ 🚀 PERFORMING CHECK-INS ──────────────────────────────────────┐
✅ Main Wallet (0x1234...abcd)
   Streak: 15 | Points: 1500
   Last Login: 2025-01-27T01:00:00Z | Next: 2025-01-28T01:00:00Z

✅ Alt Account (0x5678...efgh)
   Streak: 12 | Points: 1200
   Last Login: 2025-01-27T01:00:00Z | Next: 2025-01-28T01:00:00Z
└──────────────────────────────────────────────────────────────┘
```

### Statistics Dashboard
```
┌─ 📊 CHECK-IN STATISTICS ───────────────────────────────────────┐
   Total Check-ins: 30
   Successful: 29
   Success Rate: 96.7%
   Last Check-in: 1/27/2025, 8:00:00 AM WIB
└──────────────────────────────────────────────────────────────┘

┌─ ⏰ NEXT CHECK-IN COUNTDOWN ───────────────────────────────────┐
   Next Check-in: 1/28/2025, 8:00:00 AM WIB
   Time Remaining: 23:45:30
└──────────────────────────────────────────────────────────────┘
```