import { PromotionNotFound } from "@exceptions/promotion.exception";
import { IPromotion } from "@interfaces/models/promotion";
import { IDetailParams, IListQuery } from "@interfaces/requests/promotion";
import ZaloPromotionService from "@services/client/promotion.service";
import { NextFunction, Request, Response } from "express";
import _ from "lodash";

class ZaloPromotion {
  async list(req: Request, res: Response, next: NextFunction) {
    const query: IListQuery = req.query as any;
    next({
      code: 0,
      message: "success",
      data: {
        limit: query.limit,
        page: query.page,
        ...(await ZaloPromotionService.findAllAndCount(query)),
      },
    });
  }
  async detail(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    const promotion = await ZaloPromotionService.getById(Number(req.params.id));
    if (!promotion) {
      throw new PromotionNotFound();
    }
    next({
      code: 0,
      message: "success",
      data: {
        ..._.omit(promotion, "sapogoPromotion", "isActive", "usedUsers", "sapogoPromotionId", "createdAt", "modifiedAt", "used"),
        rest: promotion.limit ? promotion.limit - promotion.used : null,
      },
    });
  }
  async redeem(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    next({
      code: 0,
      message: "success",
      data: await ZaloPromotionService.redeem(Number(req.params.id), res.locals.zaloUser.user as any),
    });
  }
}

export default new ZaloPromotion();
