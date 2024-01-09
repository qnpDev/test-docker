import { ISapogoPromotion } from "@interfaces/models/sapogo-promotion";
import { ParamsDictionary } from "express-serve-static-core";

export interface IDetailParams extends ParamsDictionary {
  id: string;
}

export interface ICreateBody {
  name: string;
  point: number;
  description: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  sapogoPromotionId: number;
}

export interface IActivateParams extends ParamsDictionary {
  id: string;
}

export interface IDeactivateParams extends ParamsDictionary {
  id: string;
}

export interface IListQuery {
  search?: string;
  active?: boolean;
  page: number;
  limit: number;
}

export interface ISapogoPromotionCreateBody
  extends Omit<ISapogoPromotion, "id" | "createdAt" | "isActive"> {}
