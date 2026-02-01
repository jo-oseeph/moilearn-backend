// controllers/dashboardController.js

// USER dashboard ONLY
export const userDashboard = async (req, res) => {
  try {
    const user = req.user;

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Access denied. Users only.",
      });
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
    res.status(401).json({
      message: error.message,
    });
  }
};
