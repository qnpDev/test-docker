import { DataTypes, Model, Sequelize } from "sequelize";
import { IZaloGuest } from "@interfaces/models/zalo-guest";

export class MZaloGuest extends Model<IZaloGuest> implements IZaloGuest {
  zaloUid: string;
  name: string;
  readonly lastAccess?: Date;
  accessTimes: number;
  phoneNumber: string | null;
  readonly createdAt?: Date;
}

export default (sequelize: Sequelize): typeof MZaloGuest => {
  MZaloGuest.init(
    {
      zaloUid: {
        type: DataTypes.STRING(),
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      phoneNumber: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
      lastAccess: {
        type: DataTypes.DATE(),
        allowNull: false,
      },
      accessTimes: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: "lastAccess",
      tableName: "zalo_guest",
    }
  );
  return MZaloGuest;
};
