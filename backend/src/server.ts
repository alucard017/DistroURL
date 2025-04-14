import app from "./app";
import config from "./config/index";

const { ServerConfig } = config;

app.listen(ServerConfig.PORT, () => {
  console.log(`listening on ${ServerConfig.PORT}`);
});
