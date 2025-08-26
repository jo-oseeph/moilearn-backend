// dashboardController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware-like helper: extract user from token
const getUserFromToken = async (req) => {
  const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
  if (!token) throw new Error("No token provided");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");
  if (!user) throw new Error("User not found");

  return user;
};

// Controller: User Dashboard
export const userDashboard = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    // Only users can access
    if (user.role !== "user") {
      return res.status(403).json({ message: "Access denied. Users only." });
    }

    res.json({
      message: "Welcome to the User Dashboard",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

// Controller: Admin Dashboard
export const adminDashboard = async (req, res) => {
  try {
    const user = await getUserFromToken(req);

    // Only admins can access
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    res.json({
      message: "Welcome to the Admin Dashboard",
      user: {
        username: user.username,
        email: user.email,
        role: user.role,
      },
      stats: {
        usersCount: await User.countDocuments(),
        lastLogin: user.updatedAt,
      },
    });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};
