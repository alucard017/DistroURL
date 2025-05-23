import express, { Application, Request, Response } from "express";
import { globalErrorHandler } from "./middlewares/errorMiddleware";
import mainRoute from "./routes/index";
import cors from "cors";
import config from "./config/index";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
const { connectDB, RedisConfig, ZooKeeperConfig } = config;
const { connectRedis } = RedisConfig;
const { connectZK } = ZooKeeperConfig;
const app: Application = express();
app.use(
  cors({
    origin: [
      "https://distro-url.vercel.app/",
      "http://localhost:3001",
      "https://distros.tech",
    ],
    credentials: true,
  })
);
(async () => {
  try {
    await connectDB();
    await connectRedis();
    await connectZK();
  } catch (err) {
    console.error("Startup connection error", err);
    process.exit(1); // Exit if essential services fail
  }
})();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", mainRoute);

app.use(globalErrorHandler);
export default app;
