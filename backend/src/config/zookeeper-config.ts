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
  if (n === 0) return "0";
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
const ensurePathExists = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    zkClient.exists(path, (error, stat) => {
      if (error) return reject(error);
      if (stat) return resolve();

      zkClient.create(path, (createErr) => {
        if (
          createErr &&
          (createErr as any).getCode() !== zookeeper.Exception.NODE_EXISTS
        )
          return reject(createErr);
        resolve();
      });
    });
  });
};

const LOCK_ROOT = "/locks";
const LOCK_PREFIX = "token_lock_";

const acquireLock = async (): Promise<string> => {
  await ensurePathExists(LOCK_ROOT);

  return new Promise((resolve, reject) => {
    zkClient.create(
      `${LOCK_ROOT}/${LOCK_PREFIX}`,
      Buffer.alloc(0),
      zookeeper.CreateMode.EPHEMERAL_SEQUENTIAL,
      async (err, lockNodePath) => {
        if (err) {
          Logger.error("Failed to create lock node", { error: err });
          return reject(err);
        }

        const lockNodeName = lockNodePath.substring(LOCK_ROOT.length + 1);

        const tryAcquire = () => {
          zkClient.getChildren(LOCK_ROOT, (childrenErr, children) => {
            if (childrenErr) {
              return reject(childrenErr);
            }

            children.sort();

            if (children[0] === lockNodeName) {
              // This node has the lock
              resolve(lockNodePath);
            } else {
              const index = children.indexOf(lockNodeName);
              if (index === -1) {
                return reject(new Error("Lock node disappeared unexpectedly"));
              }

              // Watch the node before this one
              const previousNode = children[index - 1];
              const previousNodePath = `${LOCK_ROOT}/${previousNode}`;

              zkClient.exists(
                previousNodePath,
                (event) => {
                  if (event.getType() === zookeeper.Event.NODE_DELETED) {
                    tryAcquire(); // retry when predecessor node deleted
                  }
                },
                (existsErr, stat) => {
                  if (existsErr) {
                    return reject(existsErr);
                  }
                  if (!stat) {
                    tryAcquire(); // predecessor node already gone, try again
                  }
                }
              );
            }
          });
        };

        tryAcquire();
      }
    );
  });
};

const releaseLock = async (lockNodePath: string): Promise<void> => {
  return removeNodeAsync(lockNodePath);
};

// Core token range update with locking

const setTokenRangeWithLock = async (lastUsedToken: number): Promise<void> => {
  const lockPath = await acquireLock();
  try {
    const dataToSet = Buffer.from(String(lastUsedToken), "utf8");
    await setDataAsync("/token", dataToSet);
    Logger.info(`Updated last used token to: ${lastUsedToken}`);
  } finally {
    await releaseLock(lockPath);
  }
};

// const setTokenRange = async (lastUsedToken: number): Promise<void> => {
//   const dataToSet = Buffer.from(String(lastUsedToken), "utf8");
//   await setDataAsync("/token", dataToSet);
//   console.log(`Updated last used token to: ${lastUsedToken}`);
// };

const getTokenRange = async (): Promise<void> => {
  const data = await getDataAsync("/token");
  const lastUsed = parseInt(data.toString());
  if (isNaN(lastUsed)) {
    throw new ApiError("Invalid token value in Zookeeper", 500);
  }
  range.start = lastUsed + 1;
  range.curr = lastUsed + 1;
  range.end = range.start + 1_000_000; // Buffer of 1 million tokens, adjust as needed
  console.log(`Token range refreshed: ${range.start} to ${range.end}`);
};

const createToken = async (): Promise<void> => {
  const buffer = Buffer.from("999999", "utf8");
  const path = await createNodeAsync("/token", buffer);
  console.log("ZNode created:", path);
};

const checkIfTokenExists = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    zkClient.exists("/token", async (error, stat) => {
      if (error) {
        const appError = new ApiError("Failed to check if token exists", 500, [
          error,
        ]);
        Logger.error(appError.message, { error, path: "/token" });
        return reject(appError);
      }

      try {
        if (stat) {
          console.log("ZNode /token exists.");
        } else {
          await createToken();
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
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
          ZOOKEEPER_SERVER || `localhost :${2181}`
        }`
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
const getNextToken = async (): Promise<string> => {
  if (range.curr > range.end) {
    await getTokenRange(); // Refresh token range buffer
  }

  const tokenNumber = range.curr++;

  // Persist last used token WITH distributed lock
  await setTokenRangeWithLock(tokenNumber);

  return hashGenerator(tokenNumber);
};

export {
  range,
  hashGenerator,
  setTokenRangeWithLock as setTokenRange,
  getTokenRange,
  createToken,
  checkIfTokenExists,
  removeToken,
  getNextToken,
  connectZK,
};
