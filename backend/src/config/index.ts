import ServerConfig from "./server-config"; // Default import for default export
import connectDB from "./db-config";
import * as RedisConfig from "./redis-config";
import * as ZooKeeperConfig from "./zookeeper-config";

export default {
  ServerConfig,
  connectDB,
  RedisConfig,
  ZooKeeperConfig,
};
