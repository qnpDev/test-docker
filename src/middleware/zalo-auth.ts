import { IZaloUser } from "@interfaces/models/zalo-user";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ZaloUserService from "@services/client/zalo-user.service";
import { WrongToken } from "@exceptions/auth.exception";
import { ZaloUserNotFound } from "@exceptions/zalo-user.exception";

declare global {
  namespace Express {
    interface Locals {
      zaloUser: IZaloUser;
    }
  }
}

export default async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers);
  const { value, error }: Joi.ValidationResult<string> = Joi.string().required().validate(req.headers["x-fb-gift-zalo-access-token"]);

  if (error) {
    throw new WrongToken();
  }
  const zaloInfo = await ZaloUserService.getZaloUidByToken(value);

  const zaloUser: IZaloUser | null = await ZaloUserService.getUserByUId(zaloInfo.id);

  if (!zaloUser) {
    throw new ZaloUserNotFound();
  }

  res.locals.zaloUser = zaloUser;

  next();
};
