import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";


// ======================================================
// REGISTER USER
// ======================================================
// Creates a new user account using email and password
// ======================================================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email",
      });
    }

    // 3. Hash password before saving
    // Never store plain passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create new user document
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    // 5. Save user to database
    const savedUser = await user.save();

    // 6. Send response (never send password)
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



// ======================================================
// LOGIN USER
// ======================================================
// Authenticates user using email and password
// ======================================================
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
    // Token contains user ID and role
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




// ======================================================
// LOGOUT USER
// ======================================================
// Stateless logout (JWT handled on frontend)
// ======================================================
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