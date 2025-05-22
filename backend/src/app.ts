import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import mainRoute from "./routes/index";
import cors from "cors";
import config from "./config/index";

const { connectDB, RedisConfig, ZooKeeperConfig } = config;
const { connectRedis } = RedisConfig;
const { connectZK } = ZooKeeperConfig;
const app: Application = express();
app.use(
  cors({
    origin: ["http://localhost:3001", "http://192.168.1.111:3001"],
    credentials: true,
  })
);
connectDB();
connectRedis();
connectZK();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/api", mainRoute);

app.use(globalErrorHandler);
export default app;
