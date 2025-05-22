import express from "express";
import URLController from "../controllers/URLController";
import multer from "multer";

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.post("/url", URLController.urlPost);
router.get("/url/:identifier", URLController.urlGet);
router.delete("/del", URLController.tokenDelete);
router.delete("/url/:identifier", URLController.urlDelete);
router.post("/url/search", URLController.urlSearch);
router.post("/url/short/:identifier", URLController.urlPostPassword);
router.post("/url/bulk", upload.single("file"), URLController.urlBulkHandler);

export default router;
