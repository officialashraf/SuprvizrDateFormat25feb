import express from 'express'
import {submitpolyline,getpolyline} from '../controllers/polylineController.js';
const router = express.Router();

router.post('/submit-polyline', submitpolyline);
router.post('/get-polyline', getpolyline);//isnt working

export default router;
