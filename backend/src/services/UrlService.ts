import { IURL } from "../models/url.model";
import CRUDRepository from "../repository/CRUDRepository";
import isValidUrl from "../utils/ValidateURL";
import config from "../config/index";
const { hashGenerator, range, getTokenRange } = config.ZooKeeperConfig;
const { connectRedis } = config.RedisConfig;

class URLService {
  generateShortURL = async ({
    OriginalUrl,
    Password,
    OneTime,
    ExpiresAt,
  }: {
    OriginalUrl: string;
    Password?: string;
    OneTime?: boolean;
    ExpiresAt?: Date;
  }): Promise<string> => {
    if (!OriginalUrl || !isValidUrl(OriginalUrl)) {
      throw new Error("Invalid URL");
    }

    console.log("Received ExpiresAt:", ExpiresAt, typeof ExpiresAt);

    let expiryDate =
      ExpiresAt || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    // if ExpiresAt is a Date object from the calendar, no need to parse
    if (
      !(expiryDate instanceof Date) ||
      isNaN(expiryDate.getTime()) ||
      expiryDate <= new Date()
    ) {
      expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    }

    if (range.curr < range.end - 1 && range.curr !== 0) {
      range.curr++;
    } else {
      await getTokenRange();
      range.curr++;
    }

    const redisClient = await connectRedis();

    const cacheKey =
      `url:${OriginalUrl}` +
      (Password ? `:password:${Password}` : "") +
      `:oneTime:${OneTime ? "1" : "0"}`;

    const cachedHash = await redisClient.get(cacheKey);
    if (cachedHash) return cachedHash;

    const query: any = {
      OriginalUrl,
      OneTime: OneTime || false,
      ExpiresAt: { $gt: new Date() },
    };

    if (Password !== undefined) {
      query.Password = Password;
    } else {
      query.Password = { $in: [null, undefined, ""] };
    }

    const existingUrl = await this.findURL(query);

    if (existingUrl) {
      await redisClient.setEx(cacheKey, 600, existingUrl.Hash);
      return existingUrl.Hash;
    }

    const newUrlData: any = {
      Hash: hashGenerator(range.curr - 1),
      OriginalUrl,
      Password: Password || null,
      OneTime: OneTime || false,
      Visits: 0,
      CreatedAt: new Date(),
      ExpiresAt: expiryDate,
    };

    const newUrl: IURL = await this.createURL(newUrlData);
    await redisClient.setEx(cacheKey, 600, newUrl.Hash);
    return newUrl.Hash;
  };

  async findURL(data: any) {
    return await CRUDRepository.find(data);
  }

  async createURL(newUrlData: IURL): Promise<IURL> {
    const newUrl = await CRUDRepository.create(newUrlData);
    return newUrl;
  }

  async deleteURL(data: any): Promise<IURL | null> {
    const deleted = await CRUDRepository.delete(data);
    if (deleted) {
      const cacheKey = `url:${deleted.OriginalUrl}:password:${
        deleted.Password || ""
      }:oneTime:${deleted.OneTime ? "1" : "0"}`;
      return await CRUDRepository.deleteFromRedis(cacheKey, deleted.Hash);
    }
    return deleted;
  }

  async searchURLsByOriginal(originalUrl: string): Promise<any> {
    const regex = new RegExp(originalUrl, "i");
    return await CRUDRepository.search(regex);
  }
}

export default new URLService();
