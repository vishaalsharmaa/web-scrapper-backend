import express from 'express';
import multer from 'multer';
import { scrapColors } from '../controller/colorsController.js';
import { scrap } from '../controller/scrapController.js';

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });
const router = express.Router();

router.post('/scrap', scrap);
router.post('/colors', upload.single('image'), scrapColors);

export default router;