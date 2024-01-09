import { IMessengerUserCommentHistory } from "./messenger-user-comment-history";
import { IVoucher } from "./voucher";

export default interface IUserPointHistory {
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
