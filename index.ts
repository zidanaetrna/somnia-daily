import axios, { AxiosResponse } from 'axios';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config();

interface AirdropService {
  name: string;
  checkIn(): Promise<string>;
}

interface WalletConfig {
  privateKey: string;
  bearerToken: string;
  walletAddress?: string;
  alias?: string;
}

interface CheckInHistory {
  timestamp: string;
  success: boolean;
  totalWallets: number;
  successfulWallets: number;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

function printHeader() {
  console.clear();
  console.log(colors.cyan + colors.bright + '╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    🌙 SOMNIA DAILY CHECK-IN BOT 🌙           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝' + colors.reset);
  console.log();
}

function printSection(title: string, color: string = colors.blue) {
  console.log(color + colors.bright + '┌─ ' + title + ' ─' + '─'.repeat(Math.max(0, 55 - title.length)) + '┐' + colors.reset);
}

function printSectionEnd() {
  console.log(colors.blue + '└──────────────────────────────────────────────────────────────┘' + colors.reset);
  console.log();
}

function printSuccess(message: string) {
  console.log(colors.green + '✅ ' + message + colors.reset);
}

function printError(message: string) {
  console.log(colors.red + '❌ ' + message + colors.reset);
}

function printInfo(message: string) {
  console.log(colors.yellow + 'ℹ️  ' + message + colors.reset);
}

function printWallet(address: string, alias?: string) {
  const displayName = alias ? `${alias} (${address.slice(0, 8)}...${address.slice(-6)})` : `${address.slice(0, 8)}...${address.slice(-6)}`;
  console.log(colors.cyan + '💼 ' + displayName + colors.reset);
}

const prompt = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(colors.yellow + query + colors.reset, resolve));
};

function getNextCheckInTime(): Date {
  const now = new Date();
  const nextCheckIn = new Date();
  
  nextCheckIn.setUTCHours(1, 0, 0, 0);
  
  if (now.getUTCHours() >= 1) {
    nextCheckIn.setUTCDate(nextCheckIn.getUTCDate() + 1);
  }
  
  return nextCheckIn;
}

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateEnvFile(wallets: WalletConfig[], history: CheckInHistory[] = []) {
  const envPath = path.resolve(__dirname, '.env');
  let envContent = `SOMNIA_WALLETS=${JSON.stringify(wallets)}\n`;
  envContent += `CHECKIN_HISTORY=${JSON.stringify(history)}`;
  fs.writeFileSync(envPath, envContent, 'utf-8');
}

function loadCheckInHistory(): CheckInHistory[] {
  const envHistory = process.env.CHECKIN_HISTORY;
  if (envHistory) {
    try {
      return JSON.parse(envHistory);
    } catch (error) {
      return [];
    }
  }
  return [];
}

function saveCheckInHistory(history: CheckInHistory[], wallets: WalletConfig[]) {
  updateEnvFile(wallets, history);
}

function displayStats(history: CheckInHistory[]) {
  if (history.length === 0) return;
  
  printSection('📊 CHECK-IN STATISTICS', colors.magenta);
  
  const totalCheckIns = history.length;
  const successfulCheckIns = history.filter(h => h.success).length;
  const successRate = ((successfulCheckIns / totalCheckIns) * 100).toFixed(1);
  
  console.log(`   Total Check-ins: ${colors.bright}${totalCheckIns}${colors.reset}`);
  console.log(`   Successful: ${colors.green}${successfulCheckIns}${colors.reset}`);
  console.log(`   Success Rate: ${colors.bright}${successRate}%${colors.reset}`);
  
  if (history.length > 0) {
    const lastCheckIn = history[history.length - 1];
    console.log(`   Last Check-in: ${colors.cyan}${new Date(lastCheckIn.timestamp).toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB${colors.reset}`);
  }
  
  printSectionEnd();
}

function displayCountdown() {
  const nextCheckIn = getNextCheckInTime();
  const now = new Date();
  const timeRemaining = nextCheckIn.getTime() - now.getTime();
  
  printSection('⏰ NEXT CHECK-IN COUNTDOWN', colors.green);
  console.log(`   Next Check-in: ${colors.bright}${nextCheckIn.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB${colors.reset}`);
  console.log(`   Time Remaining: ${colors.bright}${formatTimeRemaining(timeRemaining)}${colors.reset}`);
  printSectionEnd();
}

async function getWalletConfigs(): Promise<WalletConfig[]> {
  printHeader();
  
  const envWallets = process.env.SOMNIA_WALLETS;
  let existingWallets: WalletConfig[] = [];
  if (envWallets) {
    try {
      const wallets: WalletConfig[] = JSON.parse(envWallets);
      if (Array.isArray(wallets) && wallets.every(w => w.privateKey && w.bearerToken)) {
        existingWallets = wallets.map(wallet => ({
          ...wallet,
          bearerToken: wallet.bearerToken.replace(/^Bearer\s+/i, ''),
          walletAddress: new ethers.Wallet(`0x${wallet.privateKey}`).address.toLowerCase(),
        }));
      }
    } catch (error) {
      printError('Invalid SOMNIA_WALLETS in .env, will prompt for new wallets...');
    }
  }

  if (existingWallets.length > 0) {
    printSection('💼 EXISTING WALLETS', colors.cyan);
    existingWallets.forEach((wallet, index) => {
      printWallet(wallet.walletAddress!, wallet.alias || `Wallet ${index + 1}`);
    });
    printSectionEnd();

    const addMore = await prompt('Do you want to add another wallet? (y/N): ');
    if (addMore.toLowerCase() !== 'y' && addMore.toLowerCase() !== 'yes') {
      rl.close();
      return existingWallets;
    }
    console.log();
  }

  const allWallets = [...existingWallets];
  let walletIndex = allWallets.length + 1;

  printSection('➕ ADD NEW WALLETS', colors.green);

  while (true) {
    const privateKey = await prompt(`Enter Private Key for Wallet ${walletIndex} (leave empty to finish): `);
    if (!privateKey.trim()) break;
    try {
      new ethers.Wallet(`0x${privateKey}`);
    } catch (error) {
      printError(`Invalid private key for wallet ${walletIndex}, please try again.`);
      continue;
    }

    const bearerToken = await prompt(`Enter Bearer Token for Wallet ${walletIndex}: `);
    const cleanedToken = bearerToken.replace(/^Bearer\s+/i, '');
    if (!cleanedToken.trim()) {
      printError(`Bearer token for wallet ${walletIndex} cannot be empty, please try again.`);
      continue;
    }

    const alias = await prompt(`Enter alias for Wallet ${walletIndex} (optional): `);

    const walletAddress = new ethers.Wallet(`0x${privateKey}`).address.toLowerCase();
    
    allWallets.push({
      privateKey,
      bearerToken: cleanedToken,
      walletAddress,
      alias: alias.trim() || undefined,
    });

    printSuccess(`Added wallet: ${alias.trim() || walletAddress.slice(0, 8) + '...' + walletAddress.slice(-6)}`);
    walletIndex++;
  }

  rl.close();

  if (allWallets.length > 0) {
    updateEnvFile(allWallets);
    printSuccess('Saved wallet configurations to .env');
  } else {
    throw new Error('No valid wallets provided. Exiting.');
  }

  return allWallets;
}

class SomniaService implements AirdropService {
  name = 'Somnia';
  private readonly checkInUrl = 'https://quest.somnia.network/api/users/gm';
  private readonly statsUrl = 'https://quest.somnia.network/api/stats';
  private readonly wallets: WalletConfig[];
  private readonly maxRetries = 3;
  private readonly retryDelay = 2000;

  constructor(wallets: WalletConfig[]) {
    this.wallets = wallets;
  }

  async checkInForWallet(wallet: WalletConfig, attempt = 1): Promise<{ success: boolean; message: string }> {
    const { walletAddress, bearerToken, alias } = wallet;
    const displayName = alias || `${walletAddress!.slice(0, 8)}...${walletAddress!.slice(-6)}`;

    try {
      const checkInResponse: AxiosResponse = await axios.post(
        this.checkInUrl,
        {},
        {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'Referer': 'https://quest.somnia.network/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
          },
        }
      );

      if (checkInResponse.status === 200 && checkInResponse.data) {
        const { streakCount, finalPoints } = checkInResponse.data;
        const statsResponse: AxiosResponse = await axios.get(this.statsUrl, {
          headers: {
            'Authorization': `Bearer ${bearerToken}`,
            'Content-Type': 'application/json',
            'Referer': 'https://quest.somnia.network/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
          },
        });

        let message = `${colors.green}✅ ${displayName}${colors.reset}\n`;
        message += `   Streak: ${colors.bright}${streakCount}${colors.reset} | Points: ${colors.bright}${finalPoints}${colors.reset}`;

        if (statsResponse.status === 200 && statsResponse.data) {
          const { lastLogin, nextLogin } = statsResponse.data;
          message += `\n   Last Login: ${colors.cyan}${lastLogin}${colors.reset} | Next: ${colors.cyan}${nextLogin}${colors.reset}`;
        }

        return { success: true, message };
      } else {
        return { 
          success: false, 
          message: `${colors.red}❌ ${displayName}${colors.reset}\n   Error: ${checkInResponse.data?.message || 'Unknown error'}` 
        };
      }
    } catch (error: any) {
      if (error.response?.status === 500 && attempt < this.maxRetries) {
        console.log(`${colors.yellow}⏳ Retrying ${displayName} (${attempt + 1}/${this.maxRetries})...${colors.reset}`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.checkInForWallet(wallet, attempt + 1);
      }
      
      let message = `${colors.red}❌ ${displayName}${colors.reset}\n   Error: ${error.message}`;
      if (error.response) {
        message += `\n   Status: ${error.response.status}`;
      }
      
      return { success: false, message };
    }
  }

  async checkIn(): Promise<string> {
    let results: string[] = [];
    let successCount = 0;

    printSection('🚀 PERFORMING CHECK-INS', colors.blue);

    for (const wallet of this.wallets) {
      const result = await this.checkInForWallet(wallet);
      results.push(result.message);
      if (result.success) successCount++;
      
      if (this.wallets.indexOf(wallet) < this.wallets.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    printSectionEnd();

    printSection('📋 CHECK-IN SUMMARY', colors.magenta);
    console.log(`   Total Wallets: ${colors.bright}${this.wallets.length}${colors.reset}`);
    console.log(`   Successful: ${colors.green}${successCount}${colors.reset}`);
    console.log(`   Failed: ${colors.red}${this.wallets.length - successCount}${colors.reset}`);
    printSectionEnd();

    return results.join('\n\n');
  }
}

async function performCheckIn(wallets: WalletConfig[]): Promise<void> {
  const history = loadCheckInHistory();
  
  try {
    const services: AirdropService[] = [new SomniaService(wallets)];
    let totalSuccess = 0;

    for (const service of services) {
      const result = await service.checkIn();
      console.log(result);
      totalSuccess = (result.match(/✅/g) || []).length;
    }

    const checkInRecord: CheckInHistory = {
      timestamp: new Date().toISOString(),
      success: totalSuccess > 0,
      totalWallets: wallets.length,
      successfulWallets: totalSuccess,
    };
    
    history.push(checkInRecord);
    if (history.length > 30) {
      history.splice(0, history.length - 30);
    }
    
    saveCheckInHistory(history, wallets);
    
  } catch (error: any) {
    printError(`Check-in failed: ${error.message}`);
  }
}

function scheduleNextCheckIn(wallets: WalletConfig[]) {
  const nextCheckIn = getNextCheckInTime();
  const now = new Date();
  const delay = nextCheckIn.getTime() - now.getTime();

  printInfo(`Next automatic check-in scheduled for: ${nextCheckIn.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB`);
  
  setTimeout(async () => {
    printHeader();
    printInfo('🔄 Automatic check-in starting...');
    await performCheckIn(wallets);
    displayStats(loadCheckInHistory());
    displayCountdown();
    scheduleNextCheckIn(wallets); 
  }, delay);
}

async function main() {
  try {
    const wallets = await getWalletConfigs();
    
    printHeader();
    displayStats(loadCheckInHistory());
    displayCountdown();
    await performCheckIn(wallets);
    
    displayStats(loadCheckInHistory());
    displayCountdown();
    
    scheduleNextCheckIn(wallets);
    
    printInfo('🤖 Bot is now running! Press Ctrl+C to stop.');
    
    setInterval(() => {
      process.stdout.write('\r' + colors.bright + '⏰ Next check-in in: ' + formatTimeRemaining(getNextCheckInTime().getTime() - new Date().getTime()) + colors.reset);
    }, 60000);
    
  } catch (error: any) {
    printError(`Error: ${error.message}`);
    process.exit(1);
  }
}

process.on('SIGINT', () => {
  console.log('\n' + colors.yellow + '👋 Bot stopped gracefully. Goodbye!' + colors.reset);
  process.exit(0);
});

main().catch(console.error);