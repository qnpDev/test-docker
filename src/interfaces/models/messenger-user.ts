import { IUser } from "./user";

export interface IMessengerUser {
  messengerUid: string;
  fullName: string;
  point: number;
  userId: number;
  isActive: boolean;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  user?: IUser;
}
