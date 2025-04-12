import express, { Request, Response } from "express";
import { urlPost, urlGet, tokenDelete } from "../controllers/urlController";

const router = express.Router();

// Define routes with the appropriate handlers
router.post("/url", urlPost); // Assuming urlPost is typed correctly
router.get("/url/:{identifier}", urlGet); // Ensure the "identifier" param is typed in urlGet
router.get("/del", tokenDelete); // Same for tokenDelete

export default router;
