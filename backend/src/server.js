import express from "express";
import { pool } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { authMiddleware } from "./middlewares/authMiddleware.js";
import companyRoutes from "./routes/companyRoutes.js";


const app = express();          // ✅ app created FIRST
app.use(express.json());       // ✅ middleware next

/* ---------------- DB TEST ROUTE ---------------- */
app.get("/db-test", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json(result.rows[0]);
});

/* ---------------- AUTH ROUTES ---------------- */
app.use("/api/auth", authRoutes);

/* ---------------- PROTECTED ROUTE ---------------- */
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed",
    user: req.user,
  });
});

app.use("/api/company", companyRoutes);

/* ---------------- START SERVER ---------------- */
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
