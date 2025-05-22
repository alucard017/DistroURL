import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  LOG_LEVEL: process.env.LOG_LEVEL,
  MONGO_URI: process.env.REACT_APP_MONGODB_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  ZOOKEEPER_SERVER: process.env.ZK_SERVER,
  BASE_URL: process.env.BASE_URL || `http://localhost:${process.env.PORT}`,
};
