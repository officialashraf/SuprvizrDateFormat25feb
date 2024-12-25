import express from "express"
const router = express.Router();
import {checkIn,checkOut,attendanceInOut, allAttendece,getDuration,autologOut} from  '../controllers/attendanceController.js';

// Define your all attendance route
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.post('/attendance-api', attendanceInOut);
router.get('/list/:userId', allAttendece);
router.post('/distance', getDuration);
router.get('/autolog', autologOut);

export default router;
