import { IMessengerUser } from "@interfaces/models/messenger-user";
import { IUser } from "@interfaces/models/user";
import { DataTypes, Model, Sequelize } from "sequelize";
import { MUser } from "./user";

export class MMessengerUser extends Model<IMessengerUser> implements IMessengerUser {
  messengerUid: string;
  fullName: string;
  point: number;
  userId: number;
  isActive: boolean;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  user?: IUser;
}

export default (sequelize: Sequelize): typeof MMessengerUser => {
  MMessengerUser.init(
    {
      messengerUid: {
        type: DataTypes.STRING(),
        allowNull: false,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      point: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      userId: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "messenger_user",
    }
  );
  return MMessengerUser;
};

export const MMessengerUserAssociated = () => {
  MMessengerUser.hasOne(MUser, {
    as: "user",
    foreignKey: "id",
    sourceKey: "userId",
  });
};
