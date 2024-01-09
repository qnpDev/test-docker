import { DataTypes, Model, Sequelize } from "sequelize";
import { IUser } from "@interfaces/models/user";
import { IMessengerUser } from "@interfaces/models/messenger-user";
import { IZaloUser } from "@interfaces/models/zalo-user";
import { MZaloUser } from "./zalo-user";
import { MMessengerUser } from "./messenger-user";

export class MUser extends Model<IUser> implements IUser {
  id?: number;
  point: number;
  changeClientAt: Date | null;
  messengerUser?: IMessengerUser;
  zaloUser?: IZaloUser;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
}

export default (sequelize: Sequelize): typeof MUser => {
  MUser.init(
    {
      id: {
        type: DataTypes.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
      },
      point: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      changeClientAt: {
        type: DataTypes.DATE(),
        allowNull: true,
      },
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "user",
    }
  );
  return MUser;
};

export const MUserAssociated = () => {
  MUser.hasOne(MZaloUser, {
    as: "zaloUser",
    foreignKey: "userId",
    sourceKey: "id",
  });

  MUser.hasOne(MMessengerUser, {
    as: "messengerUser",
    foreignKey: "userId",
    sourceKey: "id",
  });
};
