import { ConsoleLogger } from '@nestjs/common';

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
};

export class AppLogger extends ConsoleLogger {
  constructor(context?: string) {
    super(context || '');
  }

  log(message: string, context?: string) {
    const timestamp = this.getFormattedTimestamp();
    const ctx = context ? `[${context}]` : '';
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.green}✓${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${message}`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    const timestamp = this.getFormattedTimestamp();
    const ctx = context ? `[${context}]` : '';
    console.error(
      `${colors.dim}${timestamp}${colors.reset} ${colors.red}✗${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.red}${message}${colors.reset}`,
    );
    if (trace) {
      console.error(`${colors.dim}${trace}${colors.reset}`);
    }
  }

  warn(message: string, context?: string) {
    const timestamp = this.getFormattedTimestamp();
    const ctx = context ? `[${context}]` : '';
    console.warn(
      `${colors.dim}${timestamp}${colors.reset} ${colors.yellow}⚠${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.yellow}${message}${colors.reset}`,
    );
  }

  debug(message: string, context?: string) {
    const timestamp = this.getFormattedTimestamp();
    const ctx = context ? `[${context}]` : '';
    console.debug(
      `${colors.dim}${timestamp}${colors.reset} ${colors.blue}ℹ${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.blue}${message}${colors.reset}`,
    );
  }

  verbose(message: string, context?: string) {
    const timestamp = this.getFormattedTimestamp();
    const ctx = context ? `[${context}]` : '';
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.magenta}→${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.dim}${message}${colors.reset}`,
    );
  }

  private getFormattedTimestamp(): string {
    return AppLogger.getTimestampString();
  }

  private static getTimestampString(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  static success(message: string, context?: string) {
    const timestamp = AppLogger.getTimestampString();
    const ctx = context ? `[${context}]` : '';
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.green}✓${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.green}${message}${colors.reset}`,
    );
  }

  static info(message: string, context?: string) {
    const timestamp = AppLogger.getTimestampString();
    const ctx = context ? `[${context}]` : '';
    console.log(
      `${colors.dim}${timestamp}${colors.reset} ${colors.blue}ℹ${colors.reset} ${colors.cyan}${ctx}${colors.reset} ${colors.blue}${message}${colors.reset}`,
    );
  }

  static banner(message: string) {
    const border = colors.cyan + '═'.repeat(60) + colors.reset;
    const padding = ' '.repeat(Math.max(0, Math.floor((60 - message.length) / 2)));
    console.log('\n' + border);
    console.log(colors.cyan + padding + message + padding + colors.reset);
    console.log(border + '\n');
  }
}
