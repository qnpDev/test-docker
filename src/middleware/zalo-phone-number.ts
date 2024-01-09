import { WrongToken } from "@exceptions/auth.exception";
import ZaloUserService from "@services/client/zalo-user.service";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

declare global {
  namespace Express {
    interface Locals {
      phoneNumber: string;
    }
  }
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = Joi.object({
    accessToken: Joi.string().required(),
    token: Joi.string().required(),
  }).validate({
    accessToken: req.headers["x-fb-gift-zalo-access-token"],
    token: req.headers["x-fb-gift-zalo-token"],
  });

  if (error) {
    throw new WrongToken();
  }

  const phoneNumber = await ZaloUserService.getPhoneNumberByToken(value.accessToken, value.token);

  res.locals.phoneNumber = phoneNumber;
  next();
};
