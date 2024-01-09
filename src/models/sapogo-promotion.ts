import { IConditionItem, ISapogoPromotion } from "@interfaces/models/sapogo-promotion";
import { DataTypes, Model, Sequelize } from "sequelize";

export class MSapogoPromotion extends Model<ISapogoPromotion> implements ISapogoPromotion {
  id: number;
  name: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  orderTotalRequired: number;
  description: string;
  limit: number | null;
  limitPerCustomer: number | null;
  startDate: Date;
  endDate: Date;
  conditionType: "order" | "product" | "product_category" | "product_brand";
  conditionItems: IConditionItem[];
  isActive: boolean;
  readonly createdAt?: Date;
}

export default (sequelize: Sequelize): typeof MSapogoPromotion => {
  MSapogoPromotion.init(
    {
      id: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      discountPercent: {
        type: DataTypes.FLOAT(),
        allowNull: true,
      },
      discountAmount: {
        type: DataTypes.FLOAT(),
        allowNull: true,
      },
      orderTotalRequired: {
        type: DataTypes.FLOAT(),
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      limit: {
        type: DataTypes.INTEGER(),
        allowNull: true,
      },
      limitPerCustomer: {
        type: DataTypes.INTEGER(),
        allowNull: true,
      },
      startDate: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      endDate: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      conditionType: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      conditionItems: {
        type: DataTypes.JSONB(),
        defaultValue: [],
      },
      isActive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: false,
      tableName: "sapogo_promotion",
    }
  );

  return MSapogoPromotion;
};
