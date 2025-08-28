import Note from "../models/Note.js";

// Approve material
export const approveMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    material.status = "approved";
    await material.save();

    res.json({ message: "Material approved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error approving material", error: error.message });
  }
};

// Reject material
export const rejectMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: "Material not found" });
    }

    material.status = "rejected";
    await material.save();

    res.json({ message: "Material rejected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error rejecting material", error: error.message });
  }
};

// List pending materials (for admin review)
export const getPendingMaterials = async (req, res) => {
  try {
    const materials = await Material.find({ status: "pending" })
      .select("-file.data")
      .populate("uploadedBy", "name email");

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pending materials", error: error.message });
  }
};
