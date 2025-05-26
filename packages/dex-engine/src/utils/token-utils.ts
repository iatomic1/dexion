export class TokenUtils {
  static isContractAddress(token: string): boolean {
    return token.includes(".");
  }

  static parseContractAddress(contractAddress: string): {
    contractAddress: string;
    contractName: string;
  } {
    const parts = contractAddress.split(".");
    if (parts.length !== 2) {
      throw new Error("Invalid contract address format");
    }
    return {
      contractAddress: parts[0],
      contractName: parts[1],
    };
  }

  static formatAmount(amount: number, decimals: number): string {
    return (amount / Math.pow(10, decimals)).toFixed(decimals);
  }

  static parseAmount(amount: string, decimals: number): number {
    return Math.floor(parseFloat(amount) * Math.pow(10, decimals));
  }

  static validateTokenAddress(token: string): boolean {
    if (this.isContractAddress(token)) {
      try {
        this.parseContractAddress(token);
        return true;
      } catch {
        return false;
      }
    }
    // If it's a symbol, just check it's not empty
    return token.length > 0;
  }
}
