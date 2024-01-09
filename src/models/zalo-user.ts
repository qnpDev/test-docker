import { DataTypes, Model, Sequelize } from "sequelize";
import { IZaloUser } from "@interfaces/models/zalo-user";
import { IUser } from "@interfaces/models/user";
import { MUser } from "./user";

export class MZaloUser extends Model<IZaloUser> implements IZaloUser {
  zaloUid: string;
  phoneNumber: string;
  activatedAt: Date | null;
  userId: number;
  isActive: boolean;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  user?: IUser;
}

export default (sequelize: Sequelize): typeof MZaloUser => {
  MZaloUser.init(
    {
      zaloUid: {
        type: DataTypes.STRING(),
        allowNull: false,
        primaryKey: true,
      },
      phoneNumber: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
      activatedAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "zalo_user",
    }
  );
  return MZaloUser;
};

export const MMZaloUserAssociated = () => {
  MZaloUser.hasOne(MUser, {
    as: "user",
    foreignKey: "id",
    sourceKey: "userId",
  });
};
