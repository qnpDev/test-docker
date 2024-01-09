export interface IMessengerGuest {
  messengerUid: string;
  fullName: string;
  point: number;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
}
