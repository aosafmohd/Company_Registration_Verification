import { pool } from "../config/db.js";

/* =========================
   CREATE COMPANY PROFILE
========================= */
export const createCompany = async (req, res) => {
  try {
    const ownerId = req.user.id;
    const { company_name } = req.body;

    /* -------- VALIDATION -------- */
    if (!company_name) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    /* -------- CHECK EXISTING COMPANY -------- */
    const existing = await pool.query(
      "SELECT id FROM company_profile WHERE owner_id = $1",
      [ownerId]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Company profile already exists",
      });
    }

    /* -------- INSERT COMPANY (ONLY REAL COLUMNS) -------- */
    const result = await pool.query(
      `
      INSERT INTO company_profile (
        owner_id,
        company_name
      )
      VALUES ($1, $2)
      RETURNING *
      `,
      [ownerId, company_name]
    );

    return res.status(201).json({
      success: true,
      message: "Company profile created successfully",
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Create Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =========================
   GET COMPANY PROFILE
========================= */
export const getCompany = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM company_profile WHERE owner_id = $1",
      [ownerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });

  } catch (error) {
    console.error("Get Company Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
