import { DexPlatform, IDexService } from "../types/sdk";
import { VelarDexService } from "./velar/VelarDexService";

export class ServiceFactory {
  static createDexService(
    platform: DexPlatform,
    config: Record<string, any> = {},
  ): IDexService {
    switch (platform) {
      case DexPlatform.VELAR:
        return new VelarDexService(config);
      // Add cases for other platforms
      // case DexPlatform.ALEX:
      //   return new AlexDexService(config);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}
