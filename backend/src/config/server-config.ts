import dotenv from "dotenv";

dotenv.config();

export default {
  PORT: process.env.PORT,
  MONGO_URI: process.env.REACT_APP_MONGODB_URI,
  REDIS_URL: process.env.REDIS_URL,
  ZOOKEEPER_SERVER: process.env.ZK_SERVER,
};
