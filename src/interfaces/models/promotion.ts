import { ISapogoPromotion } from "./sapogo-promotion";

export interface IPromotion {
  id?: number;
  name: string;
  description: string;
  point: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  limit: number | null;
  limitPerUser: number | null;
  used: number;
  sapogoPromotionId: number;
  image: string | null;
  usedUsers: Record<number, number>;
  readonly createdAt?: Date;
  readonly modifiedAt?: Date;
  readonly sapogoPromotion?: ISapogoPromotion;
}
