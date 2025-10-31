import { sc } from "../services/stacks";
import { TransactionHandler } from "./TransactionHandler";

export class DexMonitor {
  constructor(
    private transactionHandler: TransactionHandler,
    private dexAddresses: string[],
  ) {}

  public start(): void {
    for (const address of this.dexAddresses) {
      sc.subscribeAddressTransactions(address, (_, tx) =>
        this.transactionHandler.handleTransaction(tx),
      );
    }
    console.log(
      `DEX monitor started for ${this.dexAddresses.length} addresses.`,
    );
  }
}
