export interface IMessengerUserCommentHistory {
  seqId?: number;
  messengerUid: string;
  facebookPostId: string;
  facebookCommentId: string;
  point: number;
  createdAt?: Date;
}
