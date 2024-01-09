import { IMessengerGuestCommentHistory } from "@interfaces/models/messenger-guest-comment-history";
import { DataTypes, Model, Sequelize } from "sequelize";

export class MMessengerGuestCommentHistory extends Model<IMessengerGuestCommentHistory> implements IMessengerGuestCommentHistory {
  seqId?: number;
  messengerGuestUid: string;
  facebookPostId: string;
  facebookCommentId: string;
  point: number;
  readonly createdAt?: Date;
}

export default (sequelize: Sequelize): typeof MMessengerGuestCommentHistory => {
  MMessengerGuestCommentHistory.init(
    {
      seqId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
        autoIncrement: true,
      },
      messengerGuestUid: {
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
      tableName: "messenger_guest_comment_history",
    }
  );
  return MMessengerGuestCommentHistory;
};
