import { IAddPointBody } from "@interfaces/requests/point";
import PointService from "@services/client/point.service";
import { NextFunction, Request, Response } from "express";

class PointController {
  async add(req: Request<{}, {}, IAddPointBody>, res: Response, next: NextFunction) {
    const { messengerUser, messengerGuest } = res.locals;
    const response = await PointService.addPoint({
      ...req.body,
      messengerUid: messengerUser?.messengerUid || messengerGuest?.messengerUid,
    });
    next({
      code: 0,
      message: "success",
      data: {
        ...response,
        pointAfter: messengerUser?.point || messengerGuest?.point + response.point,
      },
    });
  }
}

export default new PointController();
