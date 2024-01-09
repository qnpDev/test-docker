import express, { Router } from "express";

import validate from "@middleware/validate-resource";
import zaloAuth from "@middleware/zalo-auth";
import zaloPhoneNumber from "@middleware/zalo-phone-number";
import zaloReferer from "@middleware/zalo-referer";

import ZaloAccountController from "@controllers/zalo/account";
import ZaloPointController from "@controllers/zalo/point";
import ZaloVoucherController from "@controllers/zalo/voucher";

import PromotionController from "@controllers/zalo/promotion";
import { DetailPromotionSchema, ZaloListPromotionSchema } from "@validations/promotion";

import { DetailPointSchema, ZaloHistorySchema } from "@validations/point";
import { DetailVoucherSchema, ZaloListVoucherSchema } from "@validations/voucher";
import zaloGuestAuth from "@middleware/zalo-guest-auth";
const router: Router = express.Router();

// Zalo Account routes
router.get("/me", zaloReferer, ZaloAccountController.info);
router.patch("/me", zaloReferer, zaloPhoneNumber, ZaloAccountController.updatePhone);
router.post("/me/verify", zaloReferer, ZaloAccountController.verify);
router.post("/me/change-client", zaloReferer, ZaloAccountController.changeClient);

// Zalo point routes
router.get("/point/accumulate", zaloReferer, zaloAuth, ZaloPointController.getPoint);
router.get("/point", zaloReferer, zaloAuth, validate(ZaloHistorySchema), ZaloPointController.history);
router.get("/point/purchase", zaloReferer, zaloGuestAuth, ZaloPointController.getPurchasePoint);
router.get("/point/:id", zaloReferer, zaloAuth, validate(DetailPointSchema), ZaloPointController.detail);

// Promotion routes
router.get("/promotion", zaloReferer, validate(ZaloListPromotionSchema), PromotionController.list);
router.get("/promotion/:id", zaloReferer, validate(DetailPromotionSchema), PromotionController.detail);
router.post("/promotion/:id", zaloReferer, zaloAuth, PromotionController.redeem);
router.get("/voucher/:id", zaloReferer, zaloAuth, validate(DetailVoucherSchema), ZaloVoucherController.detail);
router.get("/voucher", zaloReferer, zaloAuth, validate(ZaloListVoucherSchema), ZaloVoucherController.list);
export default router;
