import mongoose from "mongoose";
import Bid from "../models/Bid.js";
import Gig from "../models/Gig.js";

class BidController {
  // Submit a bid
  static async submitBid(req, res) {
    try {
      const { gigId, message, price } = req.body;

      // Check if gig exists and is open
      const gig = await Gig.findById(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.status !== "open") {
        return res
          .status(400)
          .json({ message: "This gig is no longer accepting bids" });
      }

      // Check if user is trying to bid on their own gig
      if (gig.ownerId.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: "Cannot bid on your own gig" });
      }

      // Check if user already has a bid on this gig
      const existingBid = await Bid.findOne({
        gigId,
        freelancerId: req.user._id,
      });
      if (existingBid) {
        return res
          .status(400)
          .json({ message: "You have already submitted a bid for this gig" });
      }

      const bid = new Bid({
        gigId,
        freelancerId: req.user._id,
        message,
        price,
      });

      await bid.save();
      await bid.populate([
        { path: "freelancerId", select: "name email" },
        { path: "gigId", select: "title" },
      ]);

      res.status(201).json(bid);
    } catch (error) {
      console.error("Submit bid error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Get all bids for a specific gig (only gig owner can see)
  static async getBidsForGig(req, res) {
    try {
      const { gigId } = req.params;

      // Check if gig exists and user is the owner
      const gig = await Gig.findById(gigId);
      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.ownerId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to view bids for this gig" });
      }

      const bids = await Bid.find({ gigId })
        .populate("freelancerId", "name email")
        .sort({ createdAt: -1 });

      res.json(bids);
    } catch (error) {
      console.error("Get bids error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Hire a freelancer (Atomic transaction with race condition protection)
  static async hireFreelancer(req, res) {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        // Find the bid with session
        const bid = await Bid.findById(req.params.bidId)
          .populate("gigId")
          .populate("freelancerId", "name email")
          .session(session);

        if (!bid) {
          throw new Error("Bid not found");
        }

        // Check if user is the gig owner
        if (bid.gigId.ownerId.toString() !== req.user._id.toString()) {
          throw new Error("Not authorized to hire for this gig");
        }

        // Check if gig is still open (race condition protection)
        if (bid.gigId.status !== "open") {
          throw new Error("This gig is no longer accepting hires");
        }

        // Check if bid is still pending
        if (bid.status !== "pending") {
          throw new Error("This bid is no longer available for hiring");
        }

        // Update gig status to assigned
        await Gig.findByIdAndUpdate(
          bid.gigId._id,
          { status: "assigned" },
          { session }
        );

        // Update the hired bid status
        await Bid.findByIdAndUpdate(bid._id, { status: "hired" }, { session });

        // Reject all other bids for this gig
        await Bid.updateMany(
          {
            gigId: bid.gigId._id,
            _id: { $ne: bid._id },
            status: "pending",
          },
          { status: "rejected" },
          { session }
        );

        // Send real-time notification to the hired freelancer
        if (req.io) {
          req.io.to(bid.freelancerId._id.toString()).emit("hired", {
            message: `You have been hired for "${bid.gigId.title}"!`,
            gigTitle: bid.gigId.title,
            gigId: bid.gigId._id,
            bidId: bid._id,
          });
        }
      });

      // Fetch updated bid data
      const updatedBid = await Bid.findById(req.params.bidId)
        .populate("freelancerId", "name email")
        .populate("gigId", "title status");

      res.json({
        message: "Freelancer hired successfully",
        bid: updatedBid,
      });
    } catch (error) {
      console.error("Hire freelancer error:", error);

      let statusCode = 500;
      let message = "Server error";

      if (error.message === "Bid not found") {
        statusCode = 404;
        message = error.message;
      } else if (
        error.message.includes("Not authorized") ||
        error.message.includes("no longer accepting") ||
        error.message.includes("no longer available")
      ) {
        statusCode = 400;
        message = error.message;
      }

      res.status(statusCode).json({ message });
    } finally {
      await session.endSession();
    }
  }

  // Reject a bid (only gig owner can reject)
  static async rejectBid(req, res) {
    try {
      const bid = await Bid.findById(req.params.bidId)
        .populate("gigId")
        .populate("freelancerId", "name email");

      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }

      // Check if user is the gig owner
      if (bid.gigId.ownerId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to reject this bid" });
      }

      // Check if bid is still pending
      if (bid.status !== "pending") {
        return res
          .status(400)
          .json({ message: "Only pending bids can be rejected" });
      }

      // Check if gig is still open
      if (bid.gigId.status !== "open") {
        return res
          .status(400)
          .json({ message: "Cannot reject bids for closed gigs" });
      }

      // Update bid status to rejected
      bid.status = "rejected";
      await bid.save();

      // Send real-time notification to the freelancer
      if (req.io) {
        req.io.to(bid.freelancerId._id.toString()).emit("bidRejected", {
          message: `Your bid for "${bid.gigId.title}" has been rejected`,
          gigTitle: bid.gigId.title,
          gigId: bid.gigId._id,
          bidId: bid._id,
        });
      }

      res.json({
        message: "Bid rejected successfully",
        bid,
      });
    } catch (error) {
      console.error("Reject bid error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Get user's bids (freelancer view)
  static async getUserBids(req, res) {
    try {
      const bids = await Bid.find({ freelancerId: req.user._id })
        .populate("gigId", "title description budget status")
        .sort({ createdAt: -1 });

      res.json(bids);
    } catch (error) {
      console.error("Get user bids error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

export default BidController;
