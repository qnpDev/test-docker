import { IUser } from "./user";

export interface IZaloUser {
  zaloUid: string;
  phoneNumber: string;
  activatedAt: Date | null;
  userId: number;
  isActive: boolean;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  user?: IUser;
}
