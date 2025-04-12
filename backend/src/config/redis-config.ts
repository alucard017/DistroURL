import { createClient, RedisClientType } from "redis";
import ShortURL from "../models/urlModel";
import ServerConfig from "./server-config";

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
            await ShortURL.findOneAndUpdate(
              { Hash: hash },
              { $inc: { Visits: 1 } }
            );
          } catch (err) {
            console.error("Error updating Visits:", err);
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

const jobQueue = new Queue();

const connectRedis = async (): Promise<RedisClientType> => {
  const redisUrl = ServerConfig.REDIS_URL;

  const client: RedisClientType = createClient({
    url: redisUrl,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));

  await client.connect(); // Connect to Redis
  return client;
};

export { connectRedis, jobQueue };
