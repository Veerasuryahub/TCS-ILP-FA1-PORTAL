import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fa1mastersecret123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password, college, batch, department } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      college,
      batch,
      department,
      role: 'student', // Default role
      streak: 1,
      lastActive: new Date(),
      badges: ['Welcome Cadet'],
    });

    if (user) {
      return res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.comparePassword(password))) {
      // Update streak on login
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (user.lastActive) {
        const lastActiveDate = new Date(user.lastActive);
        const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
        const diffTime = today - lastActiveDay;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          // Active consecutive day
          user.streak += 1;
        } else if (diffDays > 1) {
          // Broke streak
          user.streak = 1;
        }
        // If diffDays === 0, it means they logged in again today, keep streak the same
      } else {
        user.streak = 1;
      }

      user.lastActive = now;

      // Award streaks badges
      if (user.streak >= 3 && !user.badges.includes('3-Day Warrior')) {
        user.badges.push('3-Day Warrior');
      }
      if (user.streak >= 7 && !user.badges.includes('7-Day Legend')) {
        user.badges.push('7-Day Legend');
      }

      await user.save();

      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Keep streak active
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (user.lastActive) {
        const lastActiveDate = new Date(user.lastActive);
        const lastActiveDay = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate());
        const diffTime = today - lastActiveDay;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          user.streak += 1;
          user.lastActive = now;
        } else if (diffDays > 1) {
          user.streak = 1;
          user.lastActive = now;
        }
      } else {
        user.streak = 1;
        user.lastActive = now;
      }

      // Check badges again
      if (user.streak >= 3 && !user.badges.includes('3-Day Warrior')) {
        user.badges.push('3-Day Warrior');
      }
      if (user.streak >= 7 && !user.badges.includes('7-Day Legend')) {
        user.badges.push('7-Day Legend');
      }

      await user.save();

      return res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        batch: user.batch,
        department: user.department,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
      });
    } else {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
