import { CustomerGetPointNotProvidePhone, DetailPointNotFound } from "@exceptions/point.exception";
import { IDetailParams, IPointHistoryQuery } from "@interfaces/requests/point";
import ZaloPointService from "@services/client/point.service";
import { NextFunction, Request, Response } from "express";
import _ from "lodash";

class ZaloPointController {
  async getPoint(req: Request, res: Response, next: NextFunction) {
    next({
      code: 0,
      message: "success",
      data: (res.locals.zaloUser.user as any).point,
    });
  }

  async history(req: Request, res: Response, next: NextFunction) {
    const query: IPointHistoryQuery = req.query as any;
    next({
      code: 0,
      message: "success",
      data: {
        limit: query.limit,
        page: query.page,
        ...(await ZaloPointService.listHistory(query, res.locals.zaloUser.userId)),
      },
    });
  }

  async detail(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    const detail = await ZaloPointService.detailAccumulate(res.locals.zaloUser.userId, Number(req.params.id));

    if (!detail) {
      throw new DetailPointNotFound();
    }

    next({
      code: 0,
      message: "success",
      data: detail,
    });
  }

  async getPurchasePoint(req: Request, res: Response, next: NextFunction) {
    const { phoneNumber } = res.locals.zaloGuest;
    if (!phoneNumber) {
      throw new CustomerGetPointNotProvidePhone();
    }
    next({
      code: 0,
      message: "success",
      data: {
        purchasePoint: await ZaloPointService.purchasePoint(phoneNumber),
      },
    });
  }
}

export default new ZaloPointController();
