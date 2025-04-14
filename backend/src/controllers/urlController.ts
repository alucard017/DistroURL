import { Request, Response, NextFunction } from "express";
import { IURL } from "../models/url.model";
import config from "../config/index";
import Core from "../common/index";
import { asyncHandler } from "../common/asyncHandler";
import isValidUrl from "../utils/ValidateURL";
import URLService from "../services/URLService";

const { ApiError, Logger, ApiResponse } = Core;

const { hashGenerator, range, getTokenRange, removeToken } =
  config.ZooKeeperConfig;
const { connectRedis, jobQueue } = config.RedisConfig;

class URLController {
  urlPost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const originalUrl = req.body.OriginalUrl;
        if (!originalUrl || !isValidUrl(originalUrl)) {
          return next(new ApiError("Invalid URL", 400));
        }

        // Update range or fetch new range
        if (range.curr < range.end - 1 && range.curr !== 0) {
          range.curr++;
        } else {
          await getTokenRange();
          range.curr++;
        }

        // Connect to Redis
        const redisClient = await connectRedis();

        // Check Redis cache
        const cachedHash = await redisClient.get(originalUrl);
        if (cachedHash) {
          const response = new ApiResponse(
            200,
            { Hash: cachedHash },
            "Hash found in Redis cache"
          );
          return res.status(response.statusCode).json(response);
        }

        // Check DB for existing URL
        const existingUrl = await URLService.findURL(originalUrl);
        if (existingUrl) {
          await redisClient.setEx(originalUrl, 600, existingUrl.Hash);

          const response = new ApiResponse(
            200,
            { Hash: existingUrl.Hash },
            "URL found"
          );
          return res.status(response.statusCode).json(response);
        }

        // Create new short URL
        const newUrlData: any = {
          Hash: hashGenerator(range.curr - 1), // Generate a new hash
          OriginalUrl: originalUrl,
          Visits: 0,
          CreatedAt: new Date(),
          ExpiresAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year expiry
        };
        const newUrl: IURL = await URLService.createURL(newUrlData);
        await redisClient.setEx(originalUrl, 600, newUrl.Hash);

        const response = new ApiResponse(
          201,
          { Hash: newUrl.Hash },
          "Short URL created"
        );
        return res.status(response.statusCode).json(response);
      } catch (error) {
        Logger.error("Error in urlPost", { error });
        return next(new ApiError("Failed to process the URL", 500, [error]));
      }
    }
  );

  urlGet = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const identifier = req.params.identifier;
        const url = await URLService.findURL({ Hash: identifier });

        if (!url) {
          return next(new ApiError("URL not found", 404));
        }

        // Enqueue the URL hash for processing
        jobQueue.enqueue(url.Hash);
        res.redirect(url.OriginalUrl); // No need to return the response
      } catch (error) {
        Logger.error("Error in urlGet", {
          error,
          hash: req.params.identifier,
        });
        return next(new ApiError("Failed to retrieve URL", 500, [error]));
      }
    }
  );

  tokenDelete = asyncHandler(
    async (_req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        await removeToken();
        const response = new ApiResponse(
          200,
          { message: "Token removed" },
          "Success"
        );
        return res.status(response.statusCode).json(response);
      } catch (error) {
        Logger.error("Error removing ZooKeeper token", { error });
        return next(
          new ApiError("Failed to remove ZooKeeper token", 500, [error])
        );
      }
    }
  );
}
export default new URLController();
