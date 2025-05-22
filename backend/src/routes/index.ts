import express from "express";
import URLController from "../controllers/URLController";

const router = express.Router();

router.post("/url", URLController.urlPost);
router.get("/url/:identifier", URLController.urlGet);
router.get("/del", URLController.tokenDelete);
router.delete("/url/:identifier", URLController.urlDelete);
router.post("/url/search", URLController.urlSearch);
router.post("/url/short/:identifier", URLController.urlPostPassword);
export default router;
