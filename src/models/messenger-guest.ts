import { IMessengerGuest } from "@interfaces/models/messenger-guest";
import { DataTypes, Model, Sequelize } from "sequelize";

export class MMessengerGuest extends Model<IMessengerGuest> implements IMessengerGuest {
  messengerUid: string;
  fullName: string;
  point: number;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
}

export default (sequelize: Sequelize): typeof MMessengerGuest => {
  MMessengerGuest.init(
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
    },
    {
      sequelize,
      updatedAt: "modifiedAt",
      tableName: "messenger_guest",
    }
  );
  return MMessengerGuest;
};
