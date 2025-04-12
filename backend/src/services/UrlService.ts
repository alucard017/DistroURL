import { IURL } from "../models/urlModel";
import UrlRepository from "../repository/UrlRepository";
import config from "../config/index";
import AppError from "../common/error/AppError"; // Assuming AppError exists

const { hashGenerator } = config.ZooKeeperConfig;

class UrlService {
  async createUrlIfNotExists(originalUrl: string): Promise<string> {
    try {
      const existingUrl = await UrlRepository.findByOriginalUrl(originalUrl);

      if (existingUrl) {
        return existingUrl.Hash;
      }

      const newUrlData: any = {
        Hash: hashGenerator(config.ZooKeeperConfig.range.curr - 1), // Generate a new hash
        OriginalUrl: originalUrl,
        Visits: 0,
        CreatedAt: new Date(),
        ExpiresAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
      };

      // Create the new URL record in the repository
      const newUrl = await UrlRepository.createUrl(newUrlData);

      // Return the newly created hash
      return newUrl.Hash;
    } catch (error) {
      // Wrap errors in a custom error class
      throw new AppError("Error handling URL creation", 500);
    }
  }
}

// Export an instance of UrlService for usage
export default new UrlService();
