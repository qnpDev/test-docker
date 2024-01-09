import { WrongValidate } from "@exceptions/validate-resource.exception";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { ObjectSchema, ValidationResult } from "joi";

export default (schema: ObjectSchema): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error, value }: ValidationResult = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      {
        allowUnknown: true,
      }
    );

    if (error) {
      throw new WrongValidate(error.message);
    }

    req.body = value.body;
    req.params = value.params;
    req.query = value.query;

    next();
  };
};
