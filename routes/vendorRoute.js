import express from 'express'
const router = express.Router();
import { authorize } from '../middlewares/auth.js';
import { vendorLogin,verifyOTPVendor,getVendorDetails, updateVendor, vendorDelete, getTrackVendor ,trackVendorNewRecord,currentLocation,imageUpdate,updateBatteryStatus,updateGpsStatus,updateInternetStatus } from '../controllers/vendorController.js'

router.post('/vendor-login',vendorLogin);
router.post('/verify-vendor',verifyOTPVendor);
router.get('/getVendor/:vendorId',authorize(['admin', 'vendor']),getVendorDetails);
router.put('/update-vendor/:vendorId', authorize(['admin']),updateVendor);
router.delete('/delete/:vendorId',authorize(['admin']),vendorDelete);
router.post('/trackVendor',authorize(['admin', 'vendor']),getTrackVendor);//check it
router.post('/vendorTrackRecord',authorize(['admin', 'vendor']),trackVendorNewRecord);//not working properly
router.post('/current-location',currentLocation);
router.post('/update-image',authorize(['admin', 'vendor']),imageUpdate);

router.post('/update-batterystatus',updateBatteryStatus);
router.post('/update-internetstatus',updateInternetStatus);//not working--check it
router.post('/update-gpsstatus',updateGpsStatus);//not working--check it

export default router;