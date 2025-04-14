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
}

export default new URLService();
