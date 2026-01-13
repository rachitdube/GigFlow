import Gig from "../models/Gig.js";

class GigController {
  // Get all gigs with search functionality
  static async getAllGigs(req, res) {
    try {
      const { search, status = "open" } = req.query;
      let query = { status };

      if (search) {
        query.$text = { $search: search };
      }

      const gigs = await Gig.find(query)
        .populate("ownerId", "name email")
        .sort({ createdAt: -1 });

      res.json(gigs);
    } catch (error) {
      console.error("Get gigs error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Get single gig by ID
  static async getGigById(req, res) {
    try {
      const gig = await Gig.findById(req.params.id).populate(
        "ownerId",
        "name email"
      );

      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      res.json(gig);
    } catch (error) {
      console.error("Get gig error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Create new gig
  static async createGig(req, res) {
    try {
      const { title, description, budget } = req.body;

      const gig = new Gig({
        title,
        description,
        budget,
        ownerId: req.user._id,
      });

      await gig.save();
      await gig.populate("ownerId", "name email");

      res.status(201).json(gig);
    } catch (error) {
      console.error("Create gig error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Update gig (only owner can update)
  static async updateGig(req, res) {
    try {
      const gig = await Gig.findById(req.params.id);

      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.ownerId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this gig" });
      }

      if (gig.status === "assigned") {
        return res.status(400).json({ message: "Cannot update assigned gig" });
      }

      const { title, description, budget } = req.body;

      if (title) gig.title = title;
      if (description) gig.description = description;
      if (budget) gig.budget = budget;

      await gig.save();
      await gig.populate("ownerId", "name email");

      res.json(gig);
    } catch (error) {
      console.error("Update gig error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

  // Delete gig (only owner can delete)
  static async deleteGig(req, res) {
    try {
      const gig = await Gig.findById(req.params.id);

      if (!gig) {
        return res.status(404).json({ message: "Gig not found" });
      }

      if (gig.ownerId.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this gig" });
      }

      if (gig.status === "assigned") {
        return res.status(400).json({ message: "Cannot delete assigned gig" });
      }

      await Gig.findByIdAndDelete(req.params.id);
      res.json({ message: "Gig deleted successfully" });
    } catch (error) {
      console.error("Delete gig error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
}

export default GigController;
