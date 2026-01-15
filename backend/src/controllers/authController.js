import bcrypt from "bcrypt";
import { pool } from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

/* =========================
   REGISTER USER
========================= */
export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      mobile_no,
      signup_type = "e",
    } = req.body;

    /* -------- BASIC VALIDATION -------- */
    if (!email || !password || !full_name || !mobile_no) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    /* -------- CHECK DUPLICATES -------- */
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1 OR mobile_no = $2",
      [email, mobile_no]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already exists",
      });
    }

    /* -------- HASH PASSWORD -------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* -------- INSERT USER -------- */
    const result = await pool.query(
      `
      INSERT INTO users (
        email,
        password,
        full_name,
        mobile_no,
        signup_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [
        email,
        hashedPassword,
        full_name,
        mobile_no,
        signup_type,
      ]
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

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "Email or mobile number already exists",
      });
    }

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

    /* -------- VALIDATION -------- */
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    /* -------- FETCH USER -------- */
    const userResult = await pool.query(
      "SELECT id, email, password, full_name FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = userResult.rows[0];

    /* -------- PASSWORD CHECK -------- */
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    /* -------- JWT TOKEN -------- */
    const token = generateToken({
      id: user.id,
      email: user.email,
    });

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
