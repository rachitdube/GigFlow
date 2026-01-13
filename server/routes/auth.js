import express from "express";
import AuthController from "../controllers/authController.js";
import auth from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Routes with controller methods
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  AuthController.register
);
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  AuthController.login
);
router.post("/logout", AuthController.logout);
router.get("/me", auth, AuthController.getCurrentUser);

export default router;
