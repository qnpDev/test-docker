import { IVoucher } from "@interfaces/models/voucher";
import { MPromotion } from "@models/promotion";
import { MVoucher } from "@models/voucher";

export default class ZaloVoucherService {
  static async getById(id: number, userId: number): Promise<IVoucher | null> {
    return await MVoucher.findOne({
      attributes: ["id", "code", "isUsed", "expiredAt", "createdAt"],
      where: {
        id,
        userId,
      },
      include: [
        {
          model: MPromotion,
          as: "promotion",
          attributes: ["name", "description"],
        },
      ],
      raw: true,
      nest: true,
    });
  }

  static async list(
    userId: number,
    { page, limit, isUsed }: { page: number; limit: number; isUsed?: boolean }
  ): Promise<{ count: number; rows: IVoucher[] }> {
    let where: any = { userId };
    if (isUsed !== undefined) {
      where.isUsed = isUsed;
    }
    return MVoucher.findAndCountAll({
      attributes: ["id", "isUsed", "expiredAt", "createdAt"],
      where,
      include: [
        {
          model: MPromotion,
          as: "promotion",
          attributes: ["name"],
        },
      ],
      offset: (page - 1) * limit,
      limit: limit,
      raw: true,
      nest: true,
    });
  }
}
