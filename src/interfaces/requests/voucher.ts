import { ParamsDictionary } from "express-serve-static-core";

export interface IListQuery {
  isUsed?: boolean;
  page: number;
  limit: number;
}

export interface IDetailParams extends ParamsDictionary {
  id: string;
}

export interface IRedeemParams extends ParamsDictionary {
  id: string;
}
