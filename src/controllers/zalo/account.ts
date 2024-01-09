import { WrongToken } from "@exceptions/auth.exception";
import ZaloUserService from "@services/client/zalo-user.service";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";
import _ from "lodash";
class ZaloAccountController {
  async verify(req: Request, res: Response, next: NextFunction) {
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
    await ZaloUserService.sendVerifyLink(value.accessToken, value.token);

    return next({
      code: 0,
      message: "success",
    });
  }

  async changeClient(req: Request, res: Response, next: NextFunction) {
    const { error, value } = Joi.object({
      accessToken: Joi.string().required(),
    }).validate({
      accessToken: req.headers["x-fb-gift-zalo-access-token"],
    });

    if (error) {
      throw new WrongToken();
    }
    await ZaloUserService.sendChangeClientLink(value.accessToken);

    return next({
      code: 0,
      message: "success",
    });
  }

  async info(req: Request, res: Response, next: NextFunction) {
    const { error, value } = Joi.string().required().validate(req.headers["x-fb-gift-zalo-access-token"]);

    if (error) {
      throw new WrongToken();
    }

    const { error: zError, id, name } = await ZaloUserService.getZaloUidByToken(value);
    if (zError) {
      throw new WrongToken();
    }

    const data = await ZaloUserService.info({
      zaloUid: id,
      name: name,
    });
    next({
      code: 0,
      message: "success",
      data: data,
    });
  }

  async updatePhone(req: Request, res: Response, next: NextFunction) {
    const { error, value } = Joi.string().required().validate(req.headers["x-fb-gift-zalo-access-token"]);

    if (error) {
      throw new WrongToken();
    }

    const zaloInfo = await ZaloUserService.getZaloUidByToken(value);
    if (zaloInfo.error) {
      throw new WrongToken();
    }
    next({
      code: 0,
      message: "success",
      data: await ZaloUserService.updateGuestPhone(zaloInfo.id, res.locals.phoneNumber),
    });
  }
}

export default new ZaloAccountController();
