import Note from "../models/Note.js";

export const getPublicStats = async (req, res) => {
  try {
    const stats = await Note.aggregate([
      {
        $match: { status: "approved" }
      },
      {
        $group: {
          _id: null,
          totalDownloads: { $sum: "$downloadsCount" },
          totalPastPapers: {
            $sum: {
              $cond: [
                { $eq: ["$category", "past_paper"] },
                1,
                0
              ]
            }
          },
          schools: { $addToSet: "$school" }
        }
      }
    ]);

    if (!stats.length) {
      return res.json({
        notesCount: 0,
        pastPapersCount: 0,
        facultiesCount: 0
      });
    }

    res.json({
      notesCount: stats[0].totalDownloads,
      pastPapersCount: stats[0].totalPastPapers,
      facultiesCount: stats[0].schools.length
    });

  } catch (error) {
    console.error("Public stats error:", error);
    res.status(500).json({ message: "Failed to fetch public stats" });
  }
};