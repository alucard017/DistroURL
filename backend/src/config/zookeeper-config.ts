import zookeeper from "node-zookeeper-client";
import Core from "../common/index";
import serverConfig from "./server-config";

const { ApiError, Logger } = Core;
const { ZOOKEEPER_SERVER } = serverConfig;

const zkClient = zookeeper.createClient(ZOOKEEPER_SERVER || "localhost:2181");

interface TokenRange {
  start: number;
  end: number;
  curr: number;
}

const range: TokenRange = {
  start: 0,
  end: 0,
  curr: 0,
};

const hashGenerator = (n: number): string => {
  const hashChars =
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let hashStr = "";

  while (n > 0) {
    hashStr += hashChars[n % 62];
    n = Math.floor(n / 62);
  }

  return hashStr;
};

const setDataAsync = (path: string, data: Buffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    zkClient.setData(path, data, (error) => {
      if (error) {
        const appError = new ApiError(`Failed to set data on ${path}`, 500, [
          error,
        ]);
        Logger.error(appError.message, { error, path });
        return reject(appError);
      }
      resolve();
    });
  });
};

const getDataAsync = (path: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    zkClient.getData(path, (error, data) => {
      if (error) {
        const appError = new ApiError(`Failed to get data from ${path}`, 500, [
          error,
        ]);
        Logger.error(appError.message, { error, path });
        return reject(appError);
      }
      resolve(data);
    });
  });
};

const createNodeAsync = (path: string, buffer: Buffer): Promise<string> => {
  return new Promise((resolve, reject) => {
    zkClient.create(
      path,
      buffer,
      zookeeper.CreateMode.PERSISTENT,
      (error, createdPath) => {
        if (error) {
          const appError = new ApiError(
            `Failed to create node at ${path}`,
            500,
            [error]
          );
          Logger.error(appError.message, { error, path });
          return reject(appError);
        }
        resolve(createdPath);
      }
    );
  });
};

const removeNodeAsync = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    zkClient.remove(path, (error) => {
      if (error) {
        const appError = new ApiError(`Failed to remove node at ${path}`, 500, [
          error,
        ]);
        Logger.error(appError.message, { error, path });
        return reject(appError);
      }
      resolve();
    });
  });
};

const setTokenRange = async (token: number): Promise<void> => {
  const dataToSet = Buffer.from(String(token), "utf8");

  await setDataAsync("/token", dataToSet);
  console.log("Token range is set.");
};

const getTokenRange = async (): Promise<void> => {
  const data = await getDataAsync("/token");
  const current = parseInt(data.toString());

  range.start = current + 1_000_000;
  range.curr = current + 1_000_000;
  range.end = current + 2_000_000;

  await setTokenRange(range.start);
};

const createToken = async (): Promise<void> => {
  const buffer = Buffer.from("0", "utf8");
  const path = await createNodeAsync("/token", buffer);
  console.log("ZNode created:", path);
};

const checkIfTokenExists = async (): Promise<void> => {
  zkClient.exists("/token", async (error, stat) => {
    if (error) {
      const appError = new ApiError("Failed to check if token exists", 500, [
        error,
      ]);
      Logger.error(appError.message, { error, path: "/token" });
      throw appError;
    }

    if (stat) {
      console.log("ZNode /token exists.");
    } else {
      await createToken();
    }
  });
};

const removeToken = async (): Promise<void> => {
  await removeNodeAsync("/token");
  console.log("ZNode /token removed.");
};

const connectZK = async (): Promise<void> => {
  try {
    zkClient.once("connected", async () => {
      Logger.info(
        `✅ Connected to Zookeeper Server at ${
          ZOOKEEPER_SERVER || "localhost"
        }:${2181}`
      );
      await checkIfTokenExists();
      await getTokenRange();
      console.log("Token range start:", range.start);
    });

    zkClient.connect();
  } catch (error) {
    const appError = new ApiError("Failed to connect to Zookeeper", 500, [
      error,
    ]);
    Logger.error(appError.message, { error });
    throw appError;
  }
};

export {
  range,
  hashGenerator,
  setTokenRange,
  getTokenRange,
  createToken,
  checkIfTokenExists,
  removeToken,
  connectZK,
};
