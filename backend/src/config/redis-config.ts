import { createClient, RedisClientType } from "redis";
import DistroURL from "../models/url.model";
import serverConfig from "./server-config";
import Core from "../common/index";

const { REDIS_HOST, REDIS_PORT } = serverConfig;
const { ApiError, Logger } = Core;

class Queue {
  private items: string[];

  constructor() {
    this.items = [];
  }

  public async enqueue(element: string): Promise<void> {
    if (this.size() < 10) {
      this.items.push(element);
    } else {
      while (!this.isEmpty()) {
        const hash = this.dequeue();
        if (hash) {
          try {
            await DistroURL.findOneAndUpdate(
              { Hash: hash },
              { $inc: { Visits: 1 } }
            );
          } catch (err) {
            const visitError = new ApiError("Error updating Visits", 500, [
              err,
            ]);

            Logger.error(visitError.message, {
              error: err,
              context: "Redis",
            });
          }
        }
      }
    }
  }

  public dequeue(): string | undefined {
    return this.items.shift();
  }

  public isEmpty(): boolean {
    return this.items.length === 0;
  }

  public size(): number {
    return this.items.length;
  }

  public print(): void {
    console.log(this.items.toString());
  }
}

const connectRedis = async (): Promise<RedisClientType> => {
  const client: RedisClientType = createClient({
    socket: {
      host: REDIS_HOST || "localhost",
      port: Number(REDIS_PORT) || 6379,
    },
  });

  client.on("error", (err) => {
    const redisError = new ApiError(
      "Redis Client Error",
      500,
      [err],
      err.stack
    );

    Logger.error(redisError.message, {
      error: err,
      context: "Redis",
    });
  });
  try {
    await client.connect();
    Logger.info(
      `✅ Connected to Redis at ${REDIS_HOST || "localhost"}:${
        REDIS_PORT || 6379
      }`
    );
    return client;
  } catch (err: any) {
    const redisError = new ApiError(
      "Failed to connect to Redis",
      500,
      [err.message],
      err.stack
    );

    Logger.error(redisError.message, {
      error: err.message,
      context: "Redis",
    });

    throw redisError;
    // throw new Error("connectRedis: Unexpected execution path without return");
  }
};

const jobQueue = new Queue();

export { connectRedis, jobQueue };
