import { IUser } from "./user";
import { IPromotion } from "./promotion";

export interface IVoucher {
  id?: number;
  userId: number;
  promotionId: number;
  code: string;
  isUsed: boolean;
  redeemByMessengerUid: string;
  expiredAt: Date;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  readonly user?: IUser;
  readonly promotion?: IPromotion;
}
