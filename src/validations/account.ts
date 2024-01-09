import { IRequest } from "@interfaces/requests/request";
import { IChangeClientBody, IVerifyBody } from "@interfaces/requests/user";
import Joi from "joi";

export const UserVerifySchema: Joi.ObjectSchema<IRequest> = Joi.object({
  body: Joi.object<IVerifyBody>({
    accessToken: Joi.string().required(),
    phoneToken: Joi.string().required(),
  }).required(),
});

export const ChangeClientSchema: Joi.ObjectSchema<IRequest> = Joi.object({
  body: Joi.object<IChangeClientBody>({
    accessToken: Joi.string().required(),
  }).required(),
});
