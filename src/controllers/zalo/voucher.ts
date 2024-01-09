import { VoucherNotFound } from "@exceptions/voucher.exception";
import { IDetailParams, IRedeemParams } from "@interfaces/requests/voucher";
import VoucherService from "@services/client/voucher.service";
import { NextFunction, Request, Response } from "express";
import _ from "lodash";

class VoucherController {
  async detail(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    const voucher = await VoucherService.getById(Number(req.params.id), res.locals.zaloUser.user?.id as number);
    if (!voucher) {
      throw new VoucherNotFound();
    }
    next({
      code: 0,
      message: "success",
      data: voucher,
    });
  }

  async list(req: Request<{}, {}, {}, { page: string; limit: string; isUsed?: string }>, res: Response, next: NextFunction) {
    const { rows, count } = await VoucherService.list(res.locals.zaloUser.userId, {
      page: Number(req.query.page),
      limit: Number(req.query.limit),
      isUsed: req.query.isUsed ? Boolean(req.query.isUsed) : undefined,
    });
    next({
      code: 0,
      message: "success",
      data: {
        count,
        page: req.query.page,
        limit: req.query.limit,
        vouchers: rows,
      },
    });
  }
}

export default new VoucherController();
