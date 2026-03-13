import User from "../models/User.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { generateToken } from "../utils/generateToken.js";
import { sendResetEmail } from "../utils/sendResetEmail.js";


// Creates a new user account using email and password
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save user to database
    const savedUser = await user.save();

    // Send response (never send password)
    res.status(201).json({
      message: "User registered successfully",
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    });

  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error during registration",
    });
  }
};


// Authenticates user using email and password
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // 2. Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 3. Compare password with hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // 4. Generate JWT token
    const token = generateToken(user._id, user.role);

    // 5. Send success response
    res.status(200).json({
      message: "Login successful",
      token,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};


// Logs out the user
export const logoutUser = async (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: "Server error during logout",
    });
  }
};


// Sends password reset link to the user's email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Never reveal whether the email is registered
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate raw token — this goes in the email URL
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash it — this is what we store in the DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendResetEmail({
      toEmail: user.email,
      resetUrl,
      userName: user.username,
    });

    return res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};


// Resets the user's password using a valid token from the email link
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    // Hash the incoming raw token to compare against the DB
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }, // must not be expired
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired. Please request a new one.",
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear the reset token fields so the link can't be reused
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. You can now log in.",
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again." });
  }
};