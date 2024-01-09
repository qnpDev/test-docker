import { IRequest } from "@interfaces/requests/request";
import { IListQuery, IDetailParams, IRedeemParams } from "@interfaces/requests/voucher";
import Joi from "joi";

export const ZaloListVoucherSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  query: Joi.object<IListQuery>({
    isUsed: Joi.boolean().optional(),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
  }).required(),
});

export const DetailVoucherSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IDetailParams>({
    id: Joi.number().required(),
  }).required(),
});

export const RedeemVoucherSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IRedeemParams>({
    id: Joi.number().required,
  }),
});
