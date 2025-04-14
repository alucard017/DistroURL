import DistroURL from "../models/url.model";
import { IURL } from "../models/url.model";
import Core from "../common/index";
const { ApiError, Logger } = Core;

class CRUDRepository {
  async find(data: any): Promise<IURL | null> {
    try {
      return await DistroURL.findOne(data);
    } catch (error) {
      const appError = new ApiError("Error finding URL", 500, [error]);
      Logger.error(appError.message, { error });
      throw appError;
    }
  }

  async create(newURLData: IURL): Promise<IURL> {
    try {
      return await DistroURL.create(newURLData);
    } catch (error) {
      const appError = new ApiError("Error creating URL", 500, [error]);
      Logger.error(appError.message, { error });
      throw appError;
    }
  }
}

export default new CRUDRepository();
