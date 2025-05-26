import {
  DexPlatform,
  type IDexService,
  type PlatformConfig,
  type SwapParams,
  type QuoteParams,
} from "../../types/sdk";
import { ServiceFactory } from "../ServiceFactory";

export class DexEngine {
  private services: Map<DexPlatform, IDexService> = new Map();

  constructor(platforms: PlatformConfig[]) {
    this.initializePlatforms(platforms);
  }

  private initializePlatforms(platforms: PlatformConfig[]): void {
    platforms.forEach(({ platform, config = {} }) => {
      const service = ServiceFactory.createDexService(platform, config);
      this.services.set(platform, service);
    });
  }

  // Add a new platform dynamically
  addPlatform(platform: DexPlatform, config: Record<string, any> = {}): void {
    const service = ServiceFactory.createDexService(platform, config);
    this.services.set(platform, service);
  }

  // Remove a platform
  removePlatform(platform: DexPlatform): void {
    this.services.delete(platform);
  }

  // Get service for a specific platform
  getService(platform: DexPlatform): IDexService {
    const service = this.services.get(platform);
    if (!service) {
      throw new Error(`Platform ${platform} not configured`);
    }
    return service;
  }

  // Execute swap on specific platform
  async executeSwap(platform: DexPlatform, params: SwapParams) {
    const service = this.getService(platform);
    return await service.executeSwap(params);
  }

  // Get quote from specific platform
  async getQuote(platform: DexPlatform, params: QuoteParams) {
    const service = this.getService(platform);
    return await service.getQuote(params);
  }

  // Get all available platforms
  getAvailablePlatforms(): DexPlatform[] {
    return Array.from(this.services.keys());
  }

  // Check if a platform is available
  isPlatformAvailable(platform: DexPlatform): boolean {
    return this.services.has(platform);
  }
}
