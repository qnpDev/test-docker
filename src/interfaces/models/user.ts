import { IMessengerUser } from "./messenger-user";
import { IZaloUser } from "./zalo-user";

export interface IUser {
  id?: number;
  point: number;
  changeClientAt: Date | null;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  messengerUser?: IMessengerUser;
  zaloUser?: IZaloUser;
}
