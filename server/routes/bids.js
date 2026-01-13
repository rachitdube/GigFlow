import express from "express";
import BidController from "../controllers/bidController.js";
import auth from "../middleware/auth.js";
import {
  validateBidSubmission,
  handleValidationErrors,
} from "../middleware/validation.js";

const router = express.Router();

// Routes with controller methods
router.post(
  "/",
  auth,
  validateBidSubmission,
  handleValidationErrors,
  BidController.submitBid
);
router.get("/:gigId", auth, BidController.getBidsForGig);
router.patch("/:bidId/hire", auth, BidController.hireFreelancer);
router.patch("/:bidId/reject", auth, BidController.rejectBid);
router.get("/user/my-bids", auth, BidController.getUserBids);

export default router;
