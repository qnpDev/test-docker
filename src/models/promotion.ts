import { DataTypes, Model, Sequelize } from "sequelize";
import { IPromotion } from "@interfaces/models/promotion";
import { ISapogoPromotion } from "@interfaces/models/sapogo-promotion";
import { MSapogoPromotion } from "./sapogo-promotion";

export class MPromotion extends Model<IPromotion> implements IPromotion {
  id?: number;
  name: string;
  point: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  limit: number | null;
  limitPerUser: number | null;
  used: number;
  description: string;
  sapogoPromotionId: number;
  usedUsers: Record<number, number>;
  image: string | null;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  readonly sapogoPromotion?: ISapogoPromotion;
}

export default (sequelize: Sequelize): typeof MPromotion => {
  MPromotion.init(
    {
      id: {
        type: DataTypes.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
      limit: {
        type: DataTypes.INTEGER(),
        allowNull: true,
      },
      limitPerUser: {
        type: DataTypes.INTEGER(),
        allowNull: true,
      },
      used: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        defaultValue: 0,
      },
      image: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      usedUsers: {
        type: DataTypes.JSONB(),
        allowNull: false,
        defaultValue: {},
      },
      sapogoPromotionId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "promotion",
    }
  );
  return MPromotion;
};

export const MPromotionAssociated = () => {
  MPromotion.hasOne(MSapogoPromotion, {
    as: "sapogoPromotion",
    foreignKey: "id",
    sourceKey: "sapogoPromotionId",
  });
};
