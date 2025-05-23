import { Request, Response, NextFunction } from "express";
// import { Multer } from "multer";
import { IURL } from "../models/url.model";
import config from "../config/index";
import Core from "../common/index";
import { asyncHandler } from "../common/asyncHandler";
import URLService from "../services/UrlService";
const { BASE_URL } = config.ServerConfig;
const { ApiError, Logger, ApiResponse } = Core;
import fs from "fs";
import { parse, writeToPath } from "fast-csv";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import isValidUrl from "../utils/ValidateURL";
const { removeToken } = config.ZooKeeperConfig;
const { jobQueue } = config.RedisConfig;

// interface MulterRequest extends Request {
//   file: Express.Multer.File;
// }

class URLController {
  urlPost = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const { OriginalUrl, Password, OneTime } = req.body;
        let { ExpiresAt } = req.body;
        if (ExpiresAt) {
          const parsedDate = new Date(ExpiresAt);
          if (!isNaN(parsedDate.getTime())) {
            ExpiresAt = parsedDate;
          } else {
            console.warn(
              "Invalid ExpiresAt received from frontend:",
              ExpiresAt
            );
            ExpiresAt = undefined; // fallback to default inside generateShortURL
          }
        }
        const hash = await URLService.generateShortURL({
          OriginalUrl,
          Password,
          OneTime,
          ExpiresAt,
        });
        const shortUrl = `${BASE_URL}/${hash}`;
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
        <head>
          <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }

      .form-container {
        background: white;
        padding: 2rem 2.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        text-align: center;
      }

      .form-container label {
        display: block;
        margin-bottom: 1rem;
        font-weight: bold;
        font-size: 1.1rem;
      }

      .form-container input[type="password"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        font-size: 1rem;
      }

      .form-container button {
        background-color: #4f46e5;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .form-container button:hover {
        background-color: #3730a3;
      }
    </style>
  </head>
  <body>
    <div class="form-container">
      <form method="POST" action="/api/url/short/${identifier}">
        <label>Enter password:</label>
        <input type="password" name="password" required />
        <button type="submit">Submit</button>
      </form>
    </div>
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
  <head>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f9;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }

      .form-container {
        background: white;
        padding: 2rem 2.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        text-align: center;
        width: 100%;
        max-width: 400px;
      }

      .error-message {
        color: #e11d48;
        font-weight: 500;
        margin-bottom: 1rem;
        font-size: 1rem;
      }

      .form-container label {
        display: block;
        margin-bottom: 1rem;
        font-weight: bold;
        font-size: 1.1rem;
      }

      .form-container input[type="password"] {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-bottom: 1.5rem;
        font-size: 1rem;
      }

      .form-container button {
        background-color: #4f46e5;
        color: white;
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 4px;
        font-size: 1rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
      }

      .form-container button:hover {
        background-color: #3730a3;
      }
    </style>
  </head>
  <body>
    <div class="form-container">
      <p class="error-message">Invalid password, try again.</p>
      <form method="POST" action="/api/url/short/${identifier}">
        <label>Enter password:</label>
        <input type="password" name="password" required />
        <button type="submit">Submit</button>
      </form>
    </div>
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

  urlBulkHandler = asyncHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<any> => {
      try {
        const file = req.file;

        if (!file) {
          return next(new ApiError("No CSV file uploaded", 400));
        }

        const filePath = file.path;
        const urlKeywords = ["url", "site", "website", "link"];
        const rawRows: any[] = [];

        // Step 1: Collect rows synchronously
        fs.createReadStream(filePath)
          .pipe(parse({ headers: true }))
          .on("data", (row: any) => {
            rawRows.push(row);
          })
          .on("end", async () => {
            // Step 2: Process rows asynchronously after reading completes
            const processedRows = [];

            for (const row of rawRows) {
              const keys = Object.keys(row);
              const urlKey = keys.find((key) =>
                urlKeywords.some((keyword) =>
                  key.toLowerCase().includes(keyword)
                )
              );

              if (urlKey && row[urlKey]) {
                try {
                  let originalUrl = row[urlKey].trim();
                  if (!/^https?:\/\//i.test(originalUrl)) {
                    originalUrl = "http://" + originalUrl;
                  }

                  // Simple URL validation
                  try {
                    new URL(originalUrl);
                  } catch {
                    throw new Error("Invalid URL format");
                  }

                  const hash = await URLService.generateShortURL({
                    OriginalUrl: originalUrl,
                  });

                  row["Short Link"] = `${BASE_URL}/${hash}`;
                } catch (err) {
                  Logger.error("Error generating short URL for row", {
                    row,
                    error: err,
                  });
                  row["Short Link"] = "Error shortening";
                }
              } else {
                row["Short Link"] = "Invalid or missing URL";
              }

              processedRows.push(row);
            }

            // Step 3: Write processed rows to new CSV file
            const outputFilename = `bulk-result-${uuidv4()}.csv`;
            const outputPath = path.join(
              __dirname,
              "..",
              "..",
              "csv",
              outputFilename
            );

            writeToPath(outputPath, processedRows, { headers: true })
              .on("finish", () => {
                res.download(outputPath, () => {
                  fs.unlinkSync(filePath); // Delete uploaded file
                  fs.unlinkSync(outputPath); // Delete output file after sending
                });
              })
              .on("error", (err: any) => {
                Logger.error("Error writing output CSV", { error: err });
                next(
                  new ApiError("Failed to write output CSV", 500, [err.message])
                );
              });
          })
          .on("error", (err: any) => {
            Logger.error("Error parsing input CSV", { error: err });
            fs.unlinkSync(filePath);
            next(new ApiError("Failed to parse CSV", 400, [err.message]));
          });
      } catch (err: any) {
        Logger.error("Unhandled error in urlBulkHandler", { error: err });
        next(
          new ApiError("Unexpected error during bulk upload", 500, [
            err.message || err,
          ])
        );
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
