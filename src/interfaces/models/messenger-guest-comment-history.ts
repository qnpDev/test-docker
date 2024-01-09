export interface IMessengerGuestCommentHistory {
  seqId?: number;
  messengerGuestUid: string;
  facebookPostId: string;
  facebookCommentId: string;
  point: number;
  readonly createdAt?: Date;
}
