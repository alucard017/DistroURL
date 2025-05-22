import { IURL } from "../models/url.model";
import CRUDRepository from "../repository/CRUDRepository";

class URLService {
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
