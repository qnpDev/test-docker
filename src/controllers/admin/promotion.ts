import { PromotionNotFound, SapogoPromotionNotFound } from "@exceptions/promotion.exception";
import { WrongValidate } from "@exceptions/validate-resource.exception";
import {
  IActivateParams,
  ICreateBody,
  IDeactivateParams,
  IDetailParams,
  IListQuery,
  ISapogoPromotionCreateBody,
} from "@interfaces/requests/promotion";
import AdminPromotionService from "@services/admin/promotion.service";
import { NextFunction, Request, Response } from "express";

class AdminPromotionController {
  async list(req: Request, res: Response, next: NextFunction) {
    const { page, limit }: IListQuery = req.query as any;
    next({
      code: 0,
      message: "success",
      data: {
        page: page,
        limit: limit,
        ...(await AdminPromotionService.getAll({ page, limit })),
      },
    });
  }

  async detail(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    const promotion = await AdminPromotionService.getById(Number(req.params.id));

    if (!promotion) {
      throw new PromotionNotFound();
    }

    next({
      code: 0,
      message: "success",
      data: promotion,
    });
  }

  async create(req: Request<{}, {}, ICreateBody>, res: Response, next: NextFunction) {
    const image: Express.Multer.File | undefined = req.file;

    next({
      code: 0,
      message: "success",
      data: {
        id: await AdminPromotionService.create({ ...req.body, image }),
      },
    });
  }

  async activate(req: Request<IActivateParams>, res: Response, next: NextFunction) {
    await AdminPromotionService.update(Number(req.params.id), { isActive: true });
    next({
      code: 0,
      message: "success",
    });
  }

  async deactivate(req: Request<IDeactivateParams>, res: Response, next: NextFunction) {
    await AdminPromotionService.update(Number(req.params.id), { isActive: false });
    next({
      code: 0,
      message: "success",
    });
  }

  async sapogoList(req: Request, res: Response, next: NextFunction) {
    const query: IListQuery = req.query as any;

    next({
      code: 0,
      message: "success",
      data: {
        page: query.page,
        limit: query.limit,
        ...(await AdminPromotionService.getAllSapogo(query)),
      },
    });
  }
  async sapogoDetail(req: Request<IDetailParams>, res: Response, next: NextFunction) {
    const sapogoPromotion = await AdminPromotionService.getByIdSapogo(Number(req.params.id));
    if (!sapogoPromotion) {
      throw new SapogoPromotionNotFound();
    }
    next({
      code: 0,
      message: "success",
      data: sapogoPromotion,
    });
  }
  async sapogoCreate(req: Request<{}, {}, ISapogoPromotionCreateBody>, res: Response, next: NextFunction) {
    const body: ISapogoPromotionCreateBody = req.body;
    if (!body.discountAmount && !body.discountPercent) {
      throw new WrongValidate("At least one in discountAmount, discountPercent required");
    }
    next({
      code: 0,
      message: "success",
      data: await AdminPromotionService.createSapogo(req.body),
    });
  }
  async sapogoActivate(req: Request<IActivateParams>, res: Response, next: NextFunction) {
    await AdminPromotionService.updateSapogo(Number(req.params.id), { isActive: true });
    next({
      code: 0,
      message: "success",
    });
  }
  async sapogoDeactivate(req: Request<IDeactivateParams>, res: Response, next: NextFunction) {
    await AdminPromotionService.updateSapogo(Number(req.params.id), { isActive: false });
    next({
      code: 0,
      message: "success",
    });
  }
}

export default new AdminPromotionController();
