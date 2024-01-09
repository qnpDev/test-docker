import { Request, Response, NextFunction } from "express";
import configs from "@configs/index";

const allowedReferers = [`https://h5.zdn.vn/zapps/${configs.app.zaloAppId}`, `zbrowser://h5.zdn.vn/zapps/${configs.app.zaloAppId}`];

export default async (req: Request, res: Response, next: NextFunction) => {
  const referer = req.headers.referer || "";
  const origin = req.headers.origin;
  const allowedCors = allowedReferers.some((element) => referer.startsWith(element));
  if (allowedCors) {
    res.setHeader("Access-Control-Allow-Origin", origin as string);
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  return next();
};
