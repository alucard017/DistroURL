import express from "express";
import URLController from "../controllers/URLController";
import multer from "multer";
import path from "path";
const upload = multer({ dest: path.join(__dirname, "..", "..", "uploads") });
const router = express.Router();

/**
 * @swagger
 * /url/p:
 *   post:
 *     summary: Shorten a URL
 *     tags: [URL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OriginalUrl:
 *                 type: string
 *               Password:
 *                 type: string
 *               OneTime:
 *                 type: boolean
 *               ExpiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Short URL created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 201
 *                 data:
 *                   type: object
 *                   properties:
 *                     ShortURL:
 *                       type: string
 *                 message:
 *                   type: string
 *                   example: Short URL created
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */
router.post("/p", URLController.urlPost);
/**
 * @swagger
 * /url/bulk:
 *   post:
 *     summary: Upload a CSV file to bulk shorten URLs
 *     tags: [URL]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Bulk shortened URLs CSV returned for download
 *       400:
 *         description: No CSV file uploaded or CSV parsing error
 *       500:
 *         description: Error processing bulk upload
 */
router.post("/bulk", upload.single("file"), URLController.urlBulkHandler);

/**
 * @swagger
 * /url/search:
 *   post:
 *     summary: Search URLs by keyword or metadata
 *     tags: [URL]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OriginalUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Matching URLs found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           OriginalUrl:
 *                             type: string
 *                           ShortURL:
 *                             type: string
 *                           OneTime:
 *                             type: boolean
 *                           ExpiresAt:
 *                             type: string
 *                             format: date-time
 *                           CreatedAt:
 *                             type: string
 *                             format: date-time
 *                           PasswordProtected:
 *                             type: boolean
 *                 message:
 *                   type: string
 *                   example: Matching short URLs found
 *       400:
 *         description: OriginalUrl is required in body
 *       404:
 *         description: No matching URLs found
 *       500:
 *         description: Failed to search URLs
 */
router.post("/search", URLController.urlSearch);

/**
 * @swagger
 * /url/del:
 *   delete:
 *     summary: Delete all URLs associated with a user's token
 *     tags: [URL]
 *     responses:
 *       200:
 *         description: All URLs deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Token removed
 *                 message:
 *                   type: string
 *                   example: Success
 *       500:
 *         description: Failed to remove token
 */
router.delete("/del", URLController.tokenDelete);

/**
 * @swagger
 * /url/del/{identifier}:
 *   delete:
 *     summary: Delete a specific short URL by identifier
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The short URL identifier
 *     responses:
 *       200:
 *         description: URL deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: URL deleted
 *                 message:
 *                   type: string
 *                   example: Success
 *       404:
 *         description: URL not found
 *       500:
 *         description: Failed to delete URL
 */
router.delete("/del/:identifier", URLController.urlDelete);

/**
 * @swagger
 * /url/{identifier}:
 *   get:
 *     summary: Get the original URL from a shortened identifier
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The short URL identifier
 *     responses:
 *       302:
 *         description: Redirects to the original URL
 *       404:
 *         description: URL not found
 *       410:
 *         description: URL has expired
 *       500:
 *         description: Internal server error
 *       200:
 *         description: Password prompt page HTML
 */
router.get("/:identifier", URLController.urlGet);

/**
 * @swagger
 * /url/{identifier}:
 *   post:
 *     summary: Submit password for password-protected short URL
 *     tags: [URL]
 *     parameters:
 *       - in: path
 *         name: identifier
 *         schema:
 *           type: string
 *         required: true
 *         description: The identifier for the short URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirects to original URL if password matches
 *       401:
 *         description: Invalid password, form page returned with error
 *       404:
 *         description: URL not found
 *       500:
 *         description: Failed to validate password
 */
router.post("/:identifier", URLController.urlPostPassword);

export default router;
