import { IConditionItem } from "@interfaces/models/sapogo-promotion";
import { IActivateParams, ICreateBody, IListQuery, ISapogoPromotionCreateBody } from "@interfaces/requests/promotion";
import { IRequest } from "@interfaces/requests/request";
import { IDetailParams } from "@interfaces/requests/promotion";
import Joi from "joi";

export const DetailPromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IDetailParams>({
    id: Joi.number().required(),
  }).required(),
});

export const AdminListPromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  query: Joi.object<IListQuery>({
    search: Joi.string().optional(),
    active: Joi.boolean().optional(),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
  }).required(),
});

export const AdminCreatePromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  body: Joi.object<ICreateBody>({
    name: Joi.string().required(),
    point: Joi.number().required(),
    isActive: Joi.boolean().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    description: Joi.string().required(),
    sapogoPromotionId: Joi.number().required(),
  }).required(),
});

export const AdminActivatePromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IActivateParams>({
    id: Joi.number().required(),
  }),
});

export const AdminDeactivatePromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  params: Joi.object<IActivateParams>({
    id: Joi.number().required(),
  }),
});

export const AdminCreateSapogoPromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  body: Joi.object<ISapogoPromotionCreateBody>({
    name: Joi.string().required(),
    code: Joi.string().required(),
    discountPercent: Joi.number().allow(null).optional(),
    discountAmount: Joi.number().allow(null).optional(),
    orderTotalRequired: Joi.number().allow(null).optional(),
    description: Joi.string().required(),
    limit: Joi.number().allow(null).optional(),
    limitPerCustomer: Joi.number().allow(null).optional(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    conditionType: Joi.string().valid("order", "product", "product_category", "product_brand").required(),
    conditionItems: Joi.array()
      .items(
        Joi.object<IConditionItem>({
          itemId: Joi.number().required(),
          itemName: Joi.string().required(),
          conditionType: Joi.string().valid("order", "product", "product_category", "product_brand").required(),
          quantity: Joi.number().required(),
          applyForAll: Joi.boolean().allow(null).optional(),
        })
      )
      .optional(),
  }),
});

export const ZaloListPromotionSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  query: Joi.object<IListQuery>({
    search: Joi.string().optional(),
    active: Joi.boolean().optional(),
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
  }).required(),
});
