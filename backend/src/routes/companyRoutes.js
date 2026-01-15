import express from "express";
import {
  createCompany,
  getCompany,
} from "../controllers/companyController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createCompany);
router.get("/", authMiddleware, getCompany);

export default router;
