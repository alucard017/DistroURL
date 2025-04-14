import mongoose from "mongoose";
import serverConfig from "./server-config";
import Core from "../common/index";
const { Logger, ApiError } = Core;

const { MONGO_URI } = serverConfig;

const connectDB = async () => {
  return mongoose
    .connect(MONGO_URI as string)
    .then(() => {
      Logger.info(`✅ Connected to DistroURL Database at MongoDB `);
    })
    .catch((err) => {
      const dbError = new ApiError(
        "Database connection failed",
        500,
        [err],
        err.stack
      );
      Logger.error(dbError.message, {
        error: err,
        context: "MongoDB",
      });
      process.exit(1);
    });
};

export default connectDB;
