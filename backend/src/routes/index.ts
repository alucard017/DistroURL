import express from "express";
import URLController from "../controllers/URLController";

const router = express.Router();

router.post("/url", URLController.urlPost);
router.get("/url/:{identifier}", URLController.urlGet);
router.get("/del", URLController.tokenDelete);

export default router;
