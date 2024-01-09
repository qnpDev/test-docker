import { ParamsDictionary } from "express-serve-static-core";

export interface IAddPointBody {
  facebookPostId: string;
  facebookCommentId: string;
}

export interface IDetailParams extends ParamsDictionary {
  id: string;
}

export interface IPointHistoryQuery {
  type: "all" | "redeem" | "accumulate";
  page: number;
  limit: number;
}
