import { IMessengerUserCommentHistory } from "@interfaces/models/messenger-user-comment-history";
import IUserPointHistory from "@interfaces/models/user-point-history";
import { IVoucher } from "@interfaces/models/voucher";
import { DataTypes, Model, Sequelize } from "sequelize";

export class MUserPointHistory extends Model<IUserPointHistory> implements IUserPointHistory {
  id?: number;
  pointBefore: number;
  pointAmount: number;
  pointAfter: number;
  type: "redeem" | "accumulate";
  sourceId: number;
  userId: number;
  messengerUid: string;
  createdAt?: Date;
  source?: IMessengerUserCommentHistory | IVoucher;
}

export default (sequelize: Sequelize): typeof MUserPointHistory => {
  MUserPointHistory.init(
    {
      id: {
        type: DataTypes.STRING(),
        autoIncrement: true,
        primaryKey: true,
      },
      pointBefore: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      pointAmount: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      pointAfter: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      sourceId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
      },
      messengerUid: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
    },
    {
      sequelize,
      updatedAt: false,
      tableName: "user_point_history",
    }
  );
  return MUserPointHistory;
};
