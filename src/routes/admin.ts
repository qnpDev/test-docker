import AdminPromotionController from "@controllers/admin/promotion";
import express, { Router } from "express";
import validate from "@middleware/validate-resource";
import {
  AdminActivatePromotionSchema,
  AdminCreatePromotionSchema,
  AdminCreateSapogoPromotionSchema,
  AdminDeactivatePromotionSchema,
  AdminListPromotionSchema,
  DetailPromotionSchema,
} from "@validations/promotion";
import uploadFile from "@middleware/upload-file";
const router: Router = express.Router();

// Admin Promotion routes
router.post("/promotion/sapogo", validate(AdminCreateSapogoPromotionSchema), AdminPromotionController.sapogoCreate);
router.get("/promotion/sapogo/:id", validate(DetailPromotionSchema), AdminPromotionController.sapogoDetail);
router.get("/promotion/sapogo", validate(AdminListPromotionSchema), AdminPromotionController.sapogoList);
router.post("/promotion/sapogo/:id/activate", validate(AdminActivatePromotionSchema), AdminPromotionController.sapogoActivate);
router.post("/promotion/sapogo/:id/deactivate", validate(AdminDeactivatePromotionSchema), AdminPromotionController.sapogoDeactivate);
router.get("/promotion", validate(AdminListPromotionSchema), AdminPromotionController.list);
router.get("/promotion/:id", validate(DetailPromotionSchema), AdminPromotionController.detail);
router.post("/promotion", uploadFile.single("image"), validate(AdminCreatePromotionSchema), AdminPromotionController.create);
router.patch("/promotion/:id/activate", validate(AdminActivatePromotionSchema), AdminPromotionController.activate);
router.patch("/promotion/:id/deactivate", validate(AdminDeactivatePromotionSchema), AdminPromotionController.deactivate);

export default router;
