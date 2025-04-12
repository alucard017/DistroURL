// src/repositories/UrlRepository.ts

import ShortURL from "../models/urlModel";
import { IURL } from "../models/urlModel"; // Assuming you have an IUrl interface for your model

class UrlRepository {
  async findByOriginalUrl(originalUrl: string): Promise<IURL | null> {
    try {
      return await ShortURL.findOne({ OriginalUrl: originalUrl });
    } catch (error) {
      throw new Error("Error finding URL");
    }
  }

  async createUrl(data: IURL): Promise<IURL> {
    try {
      return await ShortURL.create(data);
    } catch (error) {
      throw new Error("Error creating URL");
    }
  }
}

export default new UrlRepository();
