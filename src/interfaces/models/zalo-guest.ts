export interface IZaloGuest {
  zaloUid: string;
  name: string;
  accessTimes: number;
  phoneNumber: string | null;
  readonly lastAccess?: Date;
  readonly createdAt?: Date;
}
