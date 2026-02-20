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

// Admin dashboard stats (ONLY stats)
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
// Admin delete actions


export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    const filePath = extractSupabasePath(note.fileUrl);

    if (!filePath) {
      return res.status(400).json({ message: "Invalid file URL" });
    }

    const bucket = filePath.split("/")[0];
    const pathInBucket = filePath.replace(`${bucket}/`, "");

    const { error } = await supabase.storage
      .from(bucket)
      .remove([pathInBucket]);

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ message: "Failed to delete file from storage" });
    }

    await note.deleteOne();

    res.json({ message: "Note and file permanently deleted" });
  } catch (error) {
    console.error("Delete note error:", error);
    res.status(500).json({ message: "Server error deleting note" });
  }
};

// adminController.js
export const getNotes = async (req, res) => {
  try {
    const { status } = req.query; // optional: pending, approved, rejected, all
    let filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
