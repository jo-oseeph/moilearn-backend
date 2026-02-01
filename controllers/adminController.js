// controllers/adminController.js
import Note from "../models/Note.js";
import User from "../models/User.js";

// Approve note
export const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.status = "approved";
    await note.save();

    res.json({ message: "Note approved successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error approving note",
      error: error.message,
    });
  }
};

// Reject note
export const rejectNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.status = "rejected";
    await note.save();

    res.json({ message: "Note rejected successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting note",
      error: error.message,
    });
  }
};

// List pending notes
export const getPendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: "pending" })
      .populate("uploader", "name email");

    res.json(notes);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching pending notes",
      error: error.message,
    });
  }
};

// ✅ Admin dashboard stats (ONLY stats)
export const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalNotes,
      pendingNotes,
      approvedNotes,
      rejectedNotes,
    ] = await Promise.all([
      User.countDocuments(),
      Note.countDocuments(),
      Note.countDocuments({ status: "pending" }),
      Note.countDocuments({ status: "approved" }),
      Note.countDocuments({ status: "rejected" }),
    ]);

    res.status(200).json({
      stats: {
        totalUsers,
        totalNotes,
        pendingNotes,
        approvedNotes,
        rejectedNotes,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
    });
  }
};
