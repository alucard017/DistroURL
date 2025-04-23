import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import mainRoute from "./routes/index";

import config from "./config/index";

const { connectDB, RedisConfig, ZooKeeperConfig } = config;
const { connectRedis } = RedisConfig;
const { connectZK } = ZooKeeperConfig;
const app: Application = express();

connectDB();
connectRedis();
connectZK();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// app.get("/", (req: Request, res: Response) => {
//   res.json({ msg: "Hello" });
// });
app.use("/", mainRoute);

app.use(globalErrorHandler);
export default app;
