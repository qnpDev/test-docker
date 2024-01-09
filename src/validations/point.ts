import { IAddPointBody, IDetailParams, IPointHistoryQuery } from "@interfaces/requests/point";
import { IRequest } from "@interfaces/requests/request";
import Joi from "joi";

export const AddPointSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  body: Joi.object<IAddPointBody>({
    facebookPostId: Joi.string().required(),
    facebookCommentId: Joi.string().required(),
  }).required(),
});

export const ZaloHistorySchema: Joi.ObjectSchema<IRequest> = Joi.object({
  query: Joi.object<IPointHistoryQuery>({
    type: Joi.string().valid("all", "redeem", "accumulate").default("all"),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
  }),
});

export const DetailPointSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IDetailParams>({
    id: Joi.string().required(),
  }).required(),
});
