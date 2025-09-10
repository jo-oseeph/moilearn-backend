import Note from "../models/Note.js";

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
    res.status(500).json({ message: "Error approving note", error: error.message });
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
    res.status(500).json({ message: "Error rejecting note", error: error.message });
  }
};

// List pending notes (for admin review)
export const getPendingNotes = async (req, res) => {
  try {
    const notes = await Note.find({ status: "pending" })
      .select("-file.data") // avoid returning raw file binary
      .populate("uploadedBy", "name email");

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending notes", error: error.message });
  }
};
