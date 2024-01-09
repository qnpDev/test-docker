import { DuplicateMessengerUser } from "@exceptions/messenger-user.exception";
import { IChangeClientBody, IVerifyBody } from "@interfaces/requests/user";
import MessengerUserService from "@services/client/messenger-user.service";
import PointService from "@services/client/point.service";
import { NextFunction, Request, Response } from "express";
import _ from "lodash";

class AccountController {
  async profile(req: Request, res: Response, next: NextFunction) {
    const { isVerify, messengerUser, messengerGuest } = res.locals;
    next({
      code: 0,
      message: "success",
      data: {
        point: isVerify ? (messengerUser.user as any)?.point : messengerGuest.point,
        remainingTimes: await PointService.remainingTimes(messengerUser?.messengerUid || messengerGuest?.messengerUid),
      },
    });
  }

  async verify(req: Request<{}, {}, IVerifyBody>, res: Response, next: NextFunction) {
    const { isVerify, messengerGuest } = res.locals;
    const { accessToken, phoneToken } = req.body;
    if (isVerify) {
      throw new DuplicateMessengerUser();
    }
    await MessengerUserService.verify(accessToken, phoneToken, messengerGuest);

    next({
      code: 0,
      message: "success",
    });
  }

  async changeClient(req: Request<{}, {}, IChangeClientBody>, res: Response, next: NextFunction) {
    const { isVerify, messengerGuest } = res.locals;
    const { accessToken } = req.body;
    if (isVerify) {
      throw new DuplicateMessengerUser();
    }
    await MessengerUserService.changeClient(accessToken, messengerGuest);

    next({
      code: 0,
      message: "success",
    });
  }
}

export default new AccountController();
