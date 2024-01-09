import randomstring from "randomstring";
import db from "@configs/db";
import configs from "@configs/index";
import { IPromotion } from "@interfaces/models/promotion";
import { MPromotion } from "@models/promotion";
import { MVoucher } from "@models/voucher";
import s3 from "@third-party/s3";
import axios from "axios";
import { Op, Transaction } from "sequelize";
import { MSapogoPromotion } from "@models/sapogo-promotion";
import { IUser } from "@interfaces/models/user";
import { MMessengerUser } from "@models/messenger-user";
import logger from "@utils/logger";
import { IMessengerUser } from "@interfaces/models/messenger-user";
import MessengerUserService from "./messenger-user.service";
import { MUser } from "@models/user";
import { MUserPointHistory } from "@models/user-point-history";
import { OutOfStockRedeem, OutOfTurnRedeem, PointNotEnough, PromotionNotFound } from "@exceptions/promotion.exception";
import { IS_PRODUCTION } from "@configs/constant";

export default class ZaloPromotionService {
  static async findAllAndCount({ page, limit }: { page: number; limit: number }): Promise<{ count: number; promotions: IPromotion[] }> {
    let where: any = { isActive: true };
    if (IS_PRODUCTION)
      where = {
        ...where,
        startDate: {
          [Op.lte]: new Date(),
        },
        endDate: {
          [Op.gte]: new Date(),
        },
      };

    const { rows, count } = await MPromotion.findAndCountAll({
      attributes: ["id", "name", "point", "startDate", "endDate", "limit", "image", "used"],
      where,
      offset: (page - 1) * limit,
      limit,
      order: [["createdAt", "desc"]],
      raw: true,
      nest: true,
    });

    for (let row of rows) {
      if (row.image) {
        row.image = await s3.getUrl(row.image);
      }
    }

    return {
      count,
      promotions: rows,
    };
  }

  static async getById(id: number): Promise<IPromotion | null> {
    let where: any = { isActive: true, id };
    if (IS_PRODUCTION)
      where = {
        ...where,
        startDate: {
          [Op.lte]: new Date(),
        },
        endDate: {
          [Op.gte]: new Date(),
        },
      };
    const promotion: IPromotion | null = await MPromotion.findOne({
      where,
      include: [
        {
          model: MSapogoPromotion,
          as: "sapogoPromotion",
        },
      ],
      raw: true,
      nest: true,
    });

    if (promotion?.image) {
      promotion.image = await s3.getUrl(promotion.image);
    }

    return promotion;
  }
  static async redeem(promotionId: number, user: IUser): Promise<{ id: number }> {
    const transaction: Transaction = await db.sequelize.transaction();
    try {
      const promotion: IPromotion | null = await this.getById(promotionId);

      if (!promotion) {
        throw new PromotionNotFound();
      }

      if (promotion.point > user.point) {
        throw new PointNotEnough();
      }
      const used: number = promotion.usedUsers[user.id as number] || 0;

      if (promotion.limitPerUser && used >= promotion.limitPerUser) {
        throw new OutOfTurnRedeem();
      }

      if (promotion.limit && promotion.used >= promotion.limit) {
        throw new OutOfStockRedeem();
      }
      const code: string = await createCoupon(promotion.sapogoPromotion?.id as number, promotion.sapogoPromotion?.code as any);

      const messengerUser: IMessengerUser | null = await MessengerUserService.getUserByUserId(user.id as number);
      if (!messengerUser) {
        throw "Error from server";
      }

      const voucher = await MVoucher.create(
        {
          userId: user.id as number,
          promotionId,
          code,
          isUsed: false,
          expiredAt: promotion.sapogoPromotion?.endDate as any,
          redeemByMessengerUid: messengerUser.messengerUid,
        },
        {
          transaction,
        }
      );

      await MMessengerUser.decrement("point", {
        by: promotion.point,
        where: {
          messengerUid: messengerUser.messengerUid,
        },
        transaction,
      });

      await MUser.decrement("point", {
        by: promotion.point,
        where: {
          id: user.id,
        },
        transaction,
      });

      await MUserPointHistory.create(
        {
          pointBefore: user.point,
          pointAfter: user.point - promotion.point,
          pointAmount: promotion.point,
          type: "redeem",
          sourceId: voucher.dataValues.id as number,
          userId: messengerUser.userId,
          messengerUid: messengerUser.messengerUid,
        },
        {
          transaction,
        }
      );

      await MPromotion.update(
        {
          usedUsers: {
            ...promotion.usedUsers,
            [user.id as number]: (promotion.usedUsers[user.id as number] || 0) + 1,
          },
          used: promotion.used + 1,
        },
        {
          where: {
            id: promotionId,
          },
          transaction,
        }
      );
      await transaction.commit();
      return {
        id: voucher.dataValues.id as number,
      };
    } catch (error) {
      transaction?.rollback().catch((e) => logger.error(e));
      throw error;
    }
  }
}

async function createCoupon(promotionId: number, promotionCode: string): Promise<string> {
  const response = await axios.post(
    `${configs.app.sapogoUrl}/coupon_promotions/${promotionId}/coupon_codes.json`,
    {
      code:
        promotionCode +
        randomstring.generate({
          length: 6,
          charset: "alphanumeric",
        }),
    },
    {
      headers: {
        "X-Sapo-Access-Token": configs.app.sapogoPromotionToken,
      },
    }
  );
  return response.data.coupon_code.code;
}
