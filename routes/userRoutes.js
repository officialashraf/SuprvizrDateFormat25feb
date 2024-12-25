import express from 'express'
const router = express.Router();
import { authorize} from  '../middlewares/auth.js'
import { forgotPassword, resetPassword, generateOTP, signup,verifyOTP,loginSignupMobileOtp,getAllUser, getUserProfile,updateUserProfile,currentLocation, logout,userDelete } from  '../controllers/userController.js';

router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/login-api', loginSignupMobileOtp);
router.post('/verify', verifyOTP);
router.post('/generate', generateOTP);
router.post('/create-user', signup);
router.get('/userList', getAllUser);
router.get('/profile/:userId', getUserProfile);
router.put('/update-profile/:userId', updateUserProfile);
// router.get('/trackUser/+-:userId', getUserTrack);
router.post('/current-location', currentLocation);
router.delete('/delete/:userId', userDelete);

router.post('/logout-api' ,authorize(['vendor',  'employee']), logout);


export default router;
