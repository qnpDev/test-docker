import Sequelize from "sequelize";
import user, { MUserAssociated } from "./user";
import promotion, { MPromotionAssociated } from "./promotion";
import voucher, { MVoucherAssociated } from "./voucher";
import zaloUser, { MMZaloUserAssociated } from "./zalo-user";
import messengerUser, { MMessengerUserAssociated } from "./messenger-user";
import messengerUserCommentHistory from "./messenger-user-comment-history";
import sapogoPromotion from "./sapogo-promotion";
import messengerGuest from "./messenger-guest";
import messengerGuestCommentHistory from "./messenger-guest-comment-history";
import userPointHistory from "./user-point-history";
import zaloGuest from "./zalo-guest";

export default (sequelize: Sequelize.Sequelize): void => {
  messengerGuestCommentHistory(sequelize);
  messengerGuest(sequelize);
  messengerUserCommentHistory(sequelize);
  messengerUser(sequelize);
  promotion(sequelize);
  sapogoPromotion(sequelize);
  userPointHistory(sequelize);
  user(sequelize);
  zaloUser(sequelize);
  voucher(sequelize);
  zaloGuest(sequelize);

  MVoucherAssociated();
  MPromotionAssociated();
  MMessengerUserAssociated();
  MMZaloUserAssociated();
  MUserAssociated();
};
