import mongoose from "mongoose";
import serverConfig from "./server-config";

const connectDB = async () => {
  return mongoose
    .connect(serverConfig.MONGO_URI as string)
    .then(() => {
      console.log("Connected to database.");
    })
    .catch((err) => {
      console.log("Could not connect to database.");
      console.log(err);
    });
};

export default connectDB;
