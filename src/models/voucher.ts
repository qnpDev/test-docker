import { DataTypes, Model, Sequelize } from "sequelize";
import { IVoucher } from "@interfaces/models/voucher";
import { MUser } from "./user";
import { IPromotion } from "@interfaces/models/promotion";
import { MPromotion } from "./promotion";
import { IUser } from "@interfaces/models/user";

export class MVoucher extends Model<IVoucher> implements IVoucher {
  id?: number;
  userId: number;
  promotionId: number;
  code: string;
  isUsed: boolean;
  redeemByMessengerUid: string;
  expiredAt: Date;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  promotion?: IPromotion;
  user?: IUser;
}

export default (sequelize: Sequelize): typeof MVoucher => {
  MVoucher.init(
    {
      id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      promotionId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      isUsed: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
      redeemByMessengerUid: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      expiredAt: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "voucher",
    }
  );
  return MVoucher;
};

export const MVoucherAssociated = () => {
  MVoucher.hasOne(MUser, {
    as: "user",
    foreignKey: "id",
    sourceKey: "userId",
  });

  MVoucher.hasOne(MPromotion, {
    as: "promotion",
    foreignKey: "id",
    sourceKey: "promotionId",
  });
};
