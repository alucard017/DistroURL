import { Request, Response, NextFunction } from "express";
import ShortURL from "../models/urlModel";
import config from "../config/index";
import AppError from "../common/error/AppError";

// Utility function to validate URLs
const isValidUrl = (url: string): boolean => {
  const regex = /^(ftp|http|https):\/\/[^ "]+$/;
  return regex.test(url);
};

const urlPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const { ZooKeeperConfig, RedisConfig, Logger } = config;

    // Check if the URL exists in the body
    const originalUrl = req.body.OriginalUrl;
    if (!originalUrl || !isValidUrl(originalUrl)) {
      return next(new AppError("Invalid URL", 400));
    }

    // Try to increment ZooKeeper's range
    if (
      ZooKeeperConfig.range.curr < ZooKeeperConfig.range.end - 1 &&
      ZooKeeperConfig.range.curr !== 0
    ) {
      ZooKeeperConfig.range.curr++;
    } else {
      await ZooKeeperConfig.getTokenRange();
      ZooKeeperConfig.range.curr++;
    }

    // Connect to Redis
    const redisClient = await RedisConfig.connectRedis();

    // Check if the URL is already cached
    const cachedHash = await redisClient.get(originalUrl);
    if (cachedHash) {
      return res.json({ Hash: cachedHash });
    }

    // Check if URL exists in the database
    const existingUrl = await ShortURL.findOne({ OriginalUrl: originalUrl });
    if (existingUrl) {
      await redisClient.setEx(originalUrl, 600, existingUrl.Hash);
      return res.json({ Hash: existingUrl.Hash });
    }

    // Create a new URL record
    const newUrl = await ShortURL.create({
      Hash: ZooKeeperConfig.hashGenerator(ZooKeeperConfig.range.curr - 1),
      OriginalUrl: originalUrl,
      Visits: 0,
      CreatedAt: new Date(),
      ExpiresAt: new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    });

    // Cache the new URL hash in Redis
    await redisClient.setEx(originalUrl, 600, newUrl.Hash);
    return res.json({ Hash: newUrl.Hash });
  } catch (error) {
    config.Logger.error("Error in urlPost", { error });
    return next(new AppError("Failed to process the URL", 500));
  }
};

const urlGet = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const identifier = req.params.identifier;
    const { Logger, RedisConfig } = config;
    const url = await ShortURL.findOne({ Hash: identifier });

    if (!url) {
      return next(new AppError("URL not found", 404));
    }

    // Enqueue the URL hash for processing
    RedisConfig.jobQueue.enqueue(url.Hash);
    res.redirect(url.OriginalUrl); // No need to return the response
  } catch (error) {
    config.Logger.error("Error in urlGet", {
      error,
      hash: req.params.identifier,
    });
    return next(new AppError("Failed to retrieve URL", 500));
  }
};

const tokenDelete = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await config.ZooKeeperConfig.removeToken();
    res.status(200).json({ message: "Token removed" }); // No need to return the response
  } catch (error) {
    config.Logger.error("Error removing ZooKeeper token", { error });
    return next(new AppError("Failed to remove ZooKeeper token", 500));
  }
};

export { urlPost, urlGet, tokenDelete };
