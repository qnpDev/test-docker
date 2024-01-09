import { IResponse } from "@interfaces/response";
import logger from "@utils/logger";
import { NextFunction, Request, Response } from "express";

export default async (result: any, req: Request, res: Response, next: NextFunction) => {
  let status: number = 200;

  if (typeof result.code !== "number" || (result.code !== 0 && !result.code)) {
    status = 500;
    logger.error(result);
  }

  const response: IResponse = {
    code: result.code ?? null,
    message: status === 500 ? "Something went wrong" : result.message,
    data: result.data,
  };

  return res.status(status).json(response);
};
