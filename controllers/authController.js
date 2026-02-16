import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/generateToken.js';
import admin from '../utils/firebaseAdmin.js';

// ================= REGISTER ====================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      authMethods: ['email'], // Set auth method
    });

    // Save user to DB
    const savedUser = await user.save();

    // Respond with user data (omit password)
    res.status(201).json({
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      createdAt: savedUser.createdAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= LOGIN ====================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user has password auth enabled
    if (!user.authMethods.includes('email') || !user.password) {
      return res.status(401).json({
        message: 'This account uses Google sign-in. Please use "Continue with Google"'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user._id, user.role);

    // Respond with user info + token
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ================= GOOGLE LOGIN  ====================
export const googleLogin = async (req, res) => {
  try {
    const { token: firebaseToken, email: clientEmail, displayName: clientName, photoURL: clientPhoto } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    //Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const uid = decodedToken.uid || decodedToken.sub;

    // Debug: log what's in the token
    console.log("🔍 Decoded token keys:", Object.keys(decodedToken));
    console.log("🔍 Token email:", decodedToken.email);
    console.log("🔍 Client email:", clientEmail);

    // Extract email robustly - check multiple sources
    let email = decodedToken.email;

    if (!email && decodedToken.firebase?.identities?.email) {
      email = decodedToken.firebase.identities.email[0];
    }

    if (!email) {
      // Try to get email from Firebase user record
      try {
        const userRecord = await admin.auth().getUser(uid);
        email = userRecord.email;
        console.log("🔍 Email from user record:", email);
      } catch (e) {
        console.error("Failed to fetch user record:", e.message);
      }
    }

    // Final fallback: use email sent from frontend (already verified via Firebase auth)
    if (!email && clientEmail) {
      email = clientEmail;
      console.log("🔍 Using client-provided email:", email);
    }

    const name = decodedToken.name || clientName;
    const picture = decodedToken.picture || clientPhoto;

    if (!email) {
      return res.status(400).json({ message: "Email not found in Firebase token" });
    }

    //Check if user exists by EMAIL (regardless of auth method)
    let user = await User.findOne({ email });

    if (user) {
      // USER EXISTS - Auto-merge accounts
      // Add 'google' to authMethods if not already there
      if (!user.authMethods.includes('google')) {
        user.authMethods.push('google');
      }

      // Update Google-specific fields
      user.googleId = uid;
      if (picture && !user.profilePicture) {
        user.profilePicture = picture;
      }

      await user.save();

      console.log(`✅ Existing user ${email} signed in with Google (auto-merged)`);

    } else {
      //NEW USER - Create account with Google
      user = new User({
        username: name || email.split("@")[0],
        email,
        googleId: uid,
        profilePicture: picture,
        authMethods: ['google'], // Google-only account
        // No password needed for Google-only accounts
      });

      await user.save();
      console.log(`✅ New user created via Google: ${email}`);
    }

    // Generate JWT (your existing system)
    const token = generateToken(user._id, user.role);

    // Respond with same structure as normal login
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token,
      profilePicture: user.profilePicture,
      authMethods: user.authMethods, // Send available auth methods
    });
  } catch (err) {
    console.error("Google login error:", err);

    // Handle specific Firebase errors
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: "Session expired. Please sign in again." });
    }

    res.status(500).json({ message: "Google login failed" });
  }
};

// ================= LOGOUT ====================
export const logoutUser = async (req, res) => {
  try {
    res.json({ message: "User logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};