import { IMessengerUserCommentHistory } from "@interfaces/models/messenger-user-comment-history";
import { DataTypes, Model, Sequelize } from "sequelize";

export class MMessengerUserCommentHistory extends Model<IMessengerUserCommentHistory> implements IMessengerUserCommentHistory {
  seqId?: number;
  messengerUid: string;
  facebookPostId: string;
  facebookCommentId: string;
  point: number;
  createdAt?: Date;
}

export default (sequelize: Sequelize): typeof MMessengerUserCommentHistory => {
  MMessengerUserCommentHistory.init(
    {
      seqId: {
        type: DataTypes.INTEGER(),
        allowNull: true,
        autoIncrement: true,
      },
      messengerUid: {
        type: DataTypes.STRING(),
        allowNull: false,
        primaryKey: true,
      },
      facebookPostId: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      facebookCommentId: {
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
      updatedAt: false,
      tableName: "messenger_user_comment_history",
    }
  );
  return MMessengerUserCommentHistory;
};
