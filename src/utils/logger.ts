import logger, { transport } from "pino";

export default logger(
  {
    base: {
      pid: false,
    },
    level: "debug",
    timestamp: () => `,"time":"${new Date(Date.now())}"`,
  },
  transport({
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "UTC:yyyy-mm-dd HH:MM:ss.l o",
    },
  })
);
