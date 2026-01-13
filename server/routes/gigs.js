import express from "express";
import GigController from "../controllers/gigController.js";
import auth from "../middleware/auth.js";
import {
  validateGigCreation,
  validateGigUpdate,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Routes with controller methods
router.get("/", GigController.getAllGigs);
router.get("/:id", GigController.getGigById);
router.post(
  "/",
  auth,
  validateGigCreation,
  handleValidationErrors,
  GigController.createGig
);
router.put(
  "/:id",
  auth,
  validateGigUpdate,
  handleValidationErrors,
  GigController.updateGig
);
router.delete("/:id", auth, GigController.deleteGig);

export default router;
