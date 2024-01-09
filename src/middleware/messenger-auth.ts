import { WrongValidate } from "@exceptions/validate-resource.exception";
import { IMessengerGuest } from "./../interfaces/models/messenger-guest";
import { IMessengerUser } from "@interfaces/models/messenger-user";
import UserService from "@services/client/messenger-user.service";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

declare global {
  namespace Express {
    interface Locals {
      isVerify: boolean;
      messengerUser: IMessengerUser;
      messengerGuest: IMessengerGuest;
    }
  }
}

interface IRequestHeaders {
  mUid: string;
  fullName: string;
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const { error, value }: Joi.ValidationResult<IRequestHeaders> = Joi.object<IRequestHeaders>({
    mUid: Joi.string().required(),
    fullName: Joi.string().required(),
  }).validate(req.body, {
    allowUnknown: true,
  });
  if (error) {
    throw new WrongValidate(error.message);
  }

  let messUser = await UserService.getUserByUid(value.mUid);
  if (messUser) {
    res.locals.messengerUser = messUser;
    res.locals.isVerify = true;
  } else {
    let messGuest: IMessengerGuest | null = await UserService.getGuestByUid(value.mUid);
    if (!messGuest) {
      messGuest = await UserService.createGuest({
        messengerUid: value.mUid,
        fullName: value.fullName,
        point: 0,
      });
    }
    res.locals.messengerGuest = messGuest;
    res.locals.isVerify = false;
  }

  next();
};
