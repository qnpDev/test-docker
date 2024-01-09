import "dotenv/config";
import express, { Express, Request, Response, NextFunction } from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";

const REQ_DURATION = 2629746000;

import APIRoute from "./routes/index";
import { initializeDatabase } from "@configs/db";
import responseHandle from "@middleware/response-handle";
import configs from "@configs/index";
import logger from "@utils/logger";
import { NodeSSH } from "node-ssh";

const remoteSSHServer = async () => {
  const ssh = new NodeSSH();
  ssh.connect({
    host: "103.179.189.206",
    port: 22,
    username: "root",
    password: "E2M86wN5yUg1Udqw",
  });
  return ssh;
};

const execCommandInServer = (ssh: NodeSSH, command: string) => {
  return ssh.execCommand(command).then((result: any) => {
    // console.log(result);
    return result;
  });
};

const startServer = async () => {
  const app: Express = express();
  app.use(morgan("dev"));

  // setting base
  app.use(
    helmet.frameguard({
      action: "deny",
    })
  );
  // strict transport security
  app.use(
    helmet.hsts({
      maxAge: REQ_DURATION,
    })
  );

  // content security policy
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    })
  );
  // x content type options
  app.use(helmet.noSniff());
  // x xss protection
  app.use(helmet.xssFilter());
  // referrer policy
  app.use(
    helmet.referrerPolicy({
      policy: "unsafe-url",
    })
  );

  app.use(
    compression({
      level: 6, // level compress
      threshold: 100 * 1024, // > 100kb threshold to compress
      filter: (req) => {
        return !req.headers["x-no-compress"];
      },
    })
  );

  // if (configs.postgres.enable) {
  //   await initializeDatabase(false);
  // }

  // if (configs.s3.enable) {
  //   require("@third-party/s3");
  // }

  app.use(cors());
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false,
    })
  );

  const ssh = await remoteSSHServer();

  // app.use(APIRoute);
  app.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const t = await execCommandInServer(ssh, "docker ps");
    console.log(t);
    return res.json(t);
  });
  app.get("/mail", async (req: Request, res: Response, next: NextFunction) => {
    const t = await execCommandInServer(ssh, "docker logs 7920fef61e7c");
    console.log(t);
    return res.json(t);
  });
  // app.use("*", (req: Request, res: Response, next: NextFunction) => {
  //   next({
  //     code: -13,
  //     message: `api not found`,
  //   });
  // });
  // app.use(responseHandle);

  const port = process.env.PORT || 3000;
  app.listen(port);
  logger.info("Server is running at http://localhost:" + port);
};

startServer();
