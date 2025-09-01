import User from "../models/User.js";
import Note from "../models/Note.js";

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const notesUploaded = await Note.countDocuments({ uploader: req.user._id });
    const notesDownloaded = await Note.aggregate([
      { $match: { uploader: req.user._id } },
      { $group: { _id: null, total: { $sum: "$downloadsCount" } } }
    ]);

    const stats = {
      notesUploaded,
      notesDownloaded: notesDownloaded[0]?.total || 0,
      notesBookmarked: 0 // implement later if you add bookmarks
    };

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
