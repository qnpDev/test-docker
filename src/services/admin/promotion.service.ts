import { IPromotion } from "@interfaces/models/promotion";
import { ICreateBody, IListQuery, ISapogoPromotionCreateBody } from "@interfaces/requests/promotion";
import { MPromotion } from "@models/promotion";
import { Op, WhereOptions } from "sequelize";
import s3 from "@third-party/s3";
import logger from "@utils/logger";
import { ISapogoPromotion } from "@interfaces/models/sapogo-promotion";
import { MSapogoPromotion } from "@models/sapogo-promotion";
import axios from "axios";
import configs from "@configs/index";
import {
  DuplicatePromotion,
  DuplicateSapogoPromotion,
  PromotionNotFound,
  PromotionTimeRangeNotValid,
  SapogoPromotionNotFound,
} from "@exceptions/index";

const FOLDER: string = "promotion";

export default class AdminPromotionService {
  static async getById(id: number): Promise<IPromotion | null> {
    const promotion: IPromotion | null = await MPromotion.findOne({
      where: {
        id,
      },
      raw: true,
      nest: true,
    });

    if (promotion?.image) {
      promotion.image = await s3.getUrl(promotion.image);
    }
    return promotion;
  }

  static async create(payload: ICreateBody & { image?: Express.Multer.File }): Promise<number> {
    let imageName: string | null = null;

    try {
      const duplicatePromotion: IPromotion | null = await MPromotion.findOne({
        attributes: ["id"],
        where: {
          name: payload.name,
        },
      });

      if (duplicatePromotion) {
        throw new DuplicatePromotion("name");
      }

      const sapogoPromotion: ISapogoPromotion | null = await this.getByIdSapogo(payload.sapogoPromotionId);

      if (!sapogoPromotion) {
        throw new SapogoPromotionNotFound();
      }

      if (sapogoPromotion.startDate > payload.startDate) {
        throw new PromotionTimeRangeNotValid(`start date  must be greater than ${sapogoPromotion.startDate}`);
      }

      if (sapogoPromotion.endDate < payload.endDate) {
        throw new PromotionTimeRangeNotValid(`end date  must be less than ${sapogoPromotion.endDate}`);
      }

      if (payload.image) {
        imageName = await s3.uniqueFileName(payload.image.mimetype, FOLDER);
        payload.image.filename = imageName;
        await s3.uploadObject(payload.image);
      }

      const newPromotion: MPromotion = await MPromotion.create({
        ...payload,
        used: 0,
        image: imageName,
        usedUsers: {},
        limit: sapogoPromotion.limit,
        limitPerUser: sapogoPromotion.limitPerCustomer,
      });

      return newPromotion.dataValues.id as number;
    } catch (error) {
      if (imageName) {
        s3.deleteObject(imageName).catch((e) => logger.error(e.message));
      }
      throw error;
    }
  }

  static async getAll({ search, active, page, limit }: IListQuery): Promise<{ promotions: IPromotion[]; count: number }> {
    let whereOptions: WhereOptions = {};
    if (search) {
      whereOptions = {
        ...whereOptions,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }
    if (active !== null && active !== undefined) {
      whereOptions = {
        ...whereOptions,
        isActive: active,
      };
    }

    const { rows, count } = await MPromotion.findAndCountAll({
      where: whereOptions,
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "DESC"]],
      raw: true,
      nest: true,
    });

    for (let row of rows) {
      if (row.image) {
        row.image = await s3.getUrl(row.image);
      }
    }

    return {
      count: count,
      promotions: rows,
    };
  }

  static async update(id: number, payload: { isActive: boolean }): Promise<void> {
    const [affectedCount] = await MPromotion.update(payload, { where: { id } });
    if (!affectedCount) {
      throw new PromotionNotFound();
    }
  }

  static async getAllSapogo({ search, active, page, limit }: IListQuery): Promise<{ count: number; promotions: ISapogoPromotion[] }> {
    let whereOptions: WhereOptions = {};

    if (search) {
      whereOptions = {
        ...whereOptions,
        name: {
          [Op.like]: `%${search}%`,
        },
      };
    }

    if (active !== null && active !== undefined) {
      whereOptions = {
        ...whereOptions,
        isActive: active,
      };
    }

    const { rows, count } = await MSapogoPromotion.findAndCountAll({
      where: whereOptions,
      offset: (page - 1) * limit,
      limit,
      raw: true,
      nest: true,
    });

    return {
      count: count,
      promotions: rows,
    };
  }

  static async createSapogo(payload: ISapogoPromotionCreateBody): Promise<{ id: number }> {
    const duplicatePromotion: ISapogoPromotion | null = await MSapogoPromotion.findOne({
      attributes: ["code"],
      where: {
        code: payload.code,
      },
    });

    if (duplicatePromotion) {
      throw new DuplicateSapogoPromotion("code");
    }
    const id: number = await createCouponPromotion(payload);

    await MSapogoPromotion.create({
      ...payload,
      id,
      isActive: true,
    });
    return {
      id,
    };
  }

  static async getByIdSapogo(id: number): Promise<ISapogoPromotion | null> {
    return MSapogoPromotion.findOne({
      where: {
        id,
      },
      raw: true,
      nest: true,
    });
  }

  static async updateSapogo(id: number, payload: { isActive: boolean }): Promise<void> {
    const promotion: ISapogoPromotion | null = await this.getByIdSapogo(id);
    if (!promotion) {
      throw new SapogoPromotionNotFound();
    }
    await changeStatus(payload.isActive ? "active" : "inactive", id);
    await MSapogoPromotion.update(payload, { where: { id } });
  }
}

async function createCouponPromotion(payload: ISapogoPromotionCreateBody): Promise<number> {
  const body: any = {
    coupon_promotion: {
      name: payload.name,
      code: payload.code,
      condition_type: payload.conditionType,
      description: payload.description,
      combine_promotions: true,
      apply_for_all_locations: true,
      apply_for_all_customer_groups: true,
      apply_for_all_sources: false,
      status: "active",
      start_date: payload.startDate,
      end_date: payload.endDate,
      locations: [],
      customer_groups: [],
      sources: [
        {
          source_id: 6799406,
          source_name: "Facebook",
        },
        {
          source_id: 6799407,
          source_name: "Zalo",
        },
        {
          source_id: 6799410,
          source_name: "Pos",
        },
      ],
      condition_items: payload.conditionItems.map((el) => ({
        item_id: el.itemId,
        item_name: el.itemName,
        condition_type: el.conditionType,
        quantity: el.quantity,
        apply_for_all: el.applyForAll,
      })),
      maximum_amount: null,
    },
  };

  if (payload.discountAmount !== undefined) {
    body.coupon_promotion.discount_amount = payload.discountAmount ? payload.discountAmount : null;
  }

  if (payload.discountPercent !== undefined) {
    body.coupon_promotion.discount_percent = payload.discountPercent ? payload.discountPercent : null;
  }

  if (payload.orderTotalRequired !== undefined) {
    body.coupon_promotion.order_total_required = payload.orderTotalRequired ? payload.orderTotalRequired : null;
  }

  if (payload.limit !== undefined) {
    body.coupon_promotion.limit = payload.limit ? payload.limit : null;
  }

  if (payload.limitPerCustomer !== undefined) {
    body.coupon_promotion.limit_per_customer = payload.limitPerCustomer ? payload.limitPerCustomer : null;
  }

  const response = await axios.post(`${configs.app.sapogoUrl}/coupon_promotions.json`, body, {
    headers: {
      "X-Sapo-Access-Token": configs.app.sapogoPromotionToken,
    },
  });

  return response.data.coupon_promotion.id;
}

async function changeStatus(status: "active" | "inactive", id: number): Promise<void> {
  await axios.put(
    `${configs.app.sapogoUrl}/coupon_promotions/${id}/change_status.json`,
    {
      status: status,
    },
    {
      headers: {
        "X-Sapo-Access-Token": configs.app.sapogoPromotionToken,
      },
    }
  );
}
