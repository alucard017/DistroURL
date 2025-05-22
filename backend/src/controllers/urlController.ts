import { Request, Response, NextFunction } from "express";
import { IURL } from "../models/url.model";
import config from "../config/index";
import Core from "../common/index";
import { asyncHandler } from "../common/asyncHandler";
import isValidUrl from "../utils/ValidateURL";
import URLService from "../services/URLService";
const { BASE_URL } = config.ServerConfig;
const { ApiError, Logger, ApiResponse } = Core;

const { hashGenerator, range, getTokenRange, removeToken } =
  config.ZooKeeperConfig;
const { connectRedis, jobQueue } = config.RedisConfig;

class URLController {
  urlPost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { OriginalUrl, Password, OneTime, ExpiresAt } = req.body;

        if (!OriginalUrl || !isValidUrl(OriginalUrl)) {
          return next(new ApiError("Invalid URL", 400));
        }

        let expiryDate = ExpiresAt
          ? new Date(ExpiresAt)
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        if (isNaN(expiryDate.getTime()) || expiryDate <= new Date()) {
          expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        }

        if (range.curr < range.end - 1 && range.curr !== 0) {
          range.curr++;
        } else {
          await getTokenRange();
          range.curr++;
        }

        const redisClient = await connectRedis();

        const cacheKey = `url:${OriginalUrl}:password:${
          Password || ""
        }:oneTime:${OneTime ? "1" : "0"}`;

        const cachedHash = await redisClient.get(cacheKey);
        if (cachedHash) {
          const shortUrl = `${BASE_URL}/${cachedHash}`;
          const response = new ApiResponse(
            200,
            { ShortURL: shortUrl },
            "Hash found in Redis cache"
          );
          return res.status(response.statusCode).json(response);
        }

        const existingUrl = await URLService.findURL({
          OriginalUrl,
          Password: Password || { $in: [null, undefined, ""] },
          OneTime: OneTime || false,
          ExpiresAt: { $gt: new Date() },
        });

        if (existingUrl) {
          await redisClient.setEx(cacheKey, 600, existingUrl.Hash);
          const shortUrl = `${BASE_URL}/${existingUrl.Hash}`;
          const response = new ApiResponse(
            200,
            { ShortURL: shortUrl },
            "URL found"
          );
          return res.status(response.statusCode).json(response);
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

        const newUrl: IURL = await URLService.createURL(newUrlData);
        await redisClient.setEx(cacheKey, 600, newUrl.Hash);
        const shortUrl = `${BASE_URL}/${newUrl.Hash}`;
        const response = new ApiResponse(
          201,
          { ShortURL: shortUrl },
          "Short URL created"
        );
        return res.status(response.statusCode).json(response);
      } catch (error: any) {
        console.error("Error in urlPost:", error);
        Logger.error("Error in urlPost", { error });
        return next(
          new ApiError("Failed to process the URL", 500, [
            error.message || error,
          ])
        );
      }
    }
  );

  urlGet = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const identifier = req.params.identifier || req.query.identifier;
        const url = await URLService.findURL({ Hash: identifier });

        if (!url) {
          return next(new ApiError("URL not found", 404));
        }

        if (url.ExpiresAt && url.ExpiresAt <= new Date()) {
          await URLService.deleteURL({ Hash: identifier });
          return next(new ApiError("URL has expired", 410));
        }

        if (url.Password) {
          return res.send(`
          <html>
            <body>
              <form method="POST" action="/api/url/short/${identifier}">
                <label>Enter password:</label>
                <input type="password" name="password" required />
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>
        `);
        }

        jobQueue.enqueue(url.Hash);

        if (url.OneTime) {
          await URLService.deleteURL({ Hash: identifier });
        }

        res.redirect(url.OriginalUrl);
      } catch (error) {
        Logger.error("Error in urlGet", { error });
        return next(new ApiError("Failed to retrieve URL", 500, [error]));
      }
    }
  );

  urlPostPassword = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const identifier = req.params.identifier || req.query.identifier;
        const providedPassword = req.body.password;
        const url = await URLService.findURL({ Hash: identifier });

        if (!url) {
          return next(new ApiError("URL not found", 404));
        }

        if (!url.Password) {
          return res.redirect(url.OriginalUrl);
        }

        if (url.Password !== providedPassword) {
          return res.status(401).send(`
          <html>
            <body>
              <p style="color:red;">Invalid password, try again.</p>
              <form method="POST" action="/short/${identifier}">
                <label>Enter password:</label>
                <input type="password" name="password" required />
                <button type="submit">Submit</button>
              </form>
            </body>
          </html>
        `);
        }

        jobQueue.enqueue(url.Hash);

        if (url.OneTime) {
          await URLService.deleteURL({ Hash: identifier });
        }

        res.redirect(url.OriginalUrl);
      } catch (error) {
        Logger.error("Error in urlPostPassword", { error });
        return next(new ApiError("Failed to validate password", 500, [error]));
      }
    }
  );

  urlDelete = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const identifier = req.params.id || req.query.identifier;
        const url = await URLService.findURL({ Hash: identifier });

        if (!url) {
          return next(new ApiError("URL not found", 404));
        }

        await URLService.deleteURL({ Hash: identifier });

        const response = new ApiResponse(
          200,
          { message: "URL deleted" },
          "Success"
        );
        return res.status(response.statusCode).json(response);
      } catch (error) {
        Logger.error("Error deleting URL", { error });
        return next(new ApiError("Failed to delete URL", 500, [error]));
      }
    }
  );

  urlSearch = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { OriginalUrl } = req.body;

        if (!OriginalUrl || typeof OriginalUrl !== "string") {
          return next(new ApiError("OriginalUrl is required in body", 400));
        }

        const results = await URLService.searchURLsByOriginal(OriginalUrl);

        if (!results || results.length === 0) {
          return next(new ApiError("No matching URLs found", 404));
        }

        const matches = results.map((url: any) => ({
          OriginalUrl: url.OriginalUrl,
          ShortURL: `${BASE_URL}/${url.Hash}`,
          OneTime: url.OneTime,
          ExpiresAt: url.ExpiresAt,
          CreatedAt: url.CreatedAt,
          PasswordProtected: !!url.Password,
        }));

        const response = new ApiResponse(
          200,
          { results: matches },
          "Matching short URLs found"
        );
        return res.status(response.statusCode).json(response);
      } catch (error) {
        Logger.error("Error in urlSearch", { error });
        return next(new ApiError("Failed to search URLs", 500, [error]));
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
