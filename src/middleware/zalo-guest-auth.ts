import { IZaloUser } from "@interfaces/models/zalo-user";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import ZaloUserService from "@services/client/zalo-user.service";
import { IZaloGuest } from "@interfaces/models/zalo-guest";
import { WrongToken } from "@exceptions/auth.exception";
import { ZaloGuestNotFound } from "@exceptions/zalo-user.exception";

declare global {
  namespace Express {
    interface Locals {
      zaloUser: IZaloUser;
      zaloGuest: IZaloGuest;
    }
  }
}

export default async (req: Request, res: Response, next: NextFunction) => {
  // console.log(req.headers);
  const { value, error }: Joi.ValidationResult<string> = Joi.string().required().validate(req.headers["x-fb-gift-zalo-access-token"]);

  if (error) {
    throw new WrongToken();
  }
  const { error: zError, id } = await ZaloUserService.getZaloUidByToken(value);
  if (zError) {
    throw new WrongToken();
  }

  const zaloGuest = await ZaloUserService.getGuestByUId(id);

  if (!zaloGuest) {
    throw new ZaloGuestNotFound();
  }

  res.locals.zaloGuest = zaloGuest;

  next();
};
