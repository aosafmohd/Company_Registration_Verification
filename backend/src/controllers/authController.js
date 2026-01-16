import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (req, res) => {
  try {
    const { email, password, full_name, mobile_no } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!email || !password || !full_name || !mobile_no) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* ---------- CHECK EXISTING USER ---------- */
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE LOWER(email) = LOWER($1)",
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    /* ---------- HASH PASSWORD ---------- */
    const hashedPassword = await bcrypt.hash(password.trim(), 10);

    /* ---------- INSERT USER ---------- */
    const result = await pool.query(
      `
      INSERT INTO users (email, password, full_name, mobile_no)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [normalizedEmail, hashedPassword, full_name, mobile_no]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify mobile OTP.",
      data: {
        user_id: result.rows[0].id,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   LOGIN USER
========================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ---------- VALIDATION ---------- */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    /* ---------- FETCH USER ---------- */
    const userResult = await pool.query(
      `
      SELECT id, email, password, full_name
      FROM users
      WHERE LOWER(email) = LOWER($1)
      `,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    /* ---------- PASSWORD CHECK ---------- */
    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* ---------- JWT ---------- */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "90d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
        },
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
