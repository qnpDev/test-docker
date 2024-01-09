import express, { Router } from "express";

import validate from "@middleware/validate-resource";
import messengerAuth from "@middleware/messenger-auth";
import AccountController from "@controllers/client/account";
import PointController from "@controllers/client/point";

import { AddPointSchema } from "@validations/point";
import { ChangeClientSchema, UserVerifySchema } from "@validations/account";

const router: Router = express.Router();

// Account routes
router.post("/me", messengerAuth, AccountController.profile);
router.post("/me/verify", validate(UserVerifySchema), messengerAuth, AccountController.verify);
router.post("/me/change-client", validate(ChangeClientSchema), messengerAuth, AccountController.changeClient);

// Point routes
router.post("/point/add", messengerAuth, validate(AddPointSchema), PointController.add);

export default router;
