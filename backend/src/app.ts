import express, { Application, Request, Response, NextFunction } from "express";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import mainRoute from "./routes/index"; // Ensure you export the route as a default export
import purgeAliases from "./workers/purgeAliases";

import config from "./config/index";

const app: Application = express();

// @ts-ignore
config.connectDB();
config.RedisConfig.connectRedis();
config.ZooKeeperConfig.connectZK();

// Middleware for error handling
app.use(globalErrorHandler);

// Middleware for parsing requests
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ msg: "Hello" });
});
// app.use("/", mainRoute);

// Catch-all route for 404 Not Found
// app.get("*", (req: Request, res: Response) => {
//   res.status(404).send("<h1>404 Not Found</h1>");
// });

export default app;
