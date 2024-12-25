 import express from "express";

import {authorize} from '../middlewares/auth.js';
import {adminLogin, vendorListing, addVendorSubscription,updateVendorStatus,dashbboardCounts,RecentVendorListing,getEmpList,deleteEmployee} from '../controllers/adminController.js'
const router = express.Router();




router.post('/admin-login', adminLogin);

router.post('/vendor-listing',authorize(['admin']), vendorListing);

router.post('/add-subscription', authorize(['admin']), addVendorSubscription);

router.post('/update-vendorstatus', authorize(['admin']), updateVendorStatus);

router.get('/dashboard-counts',authorize(['admin']), dashbboardCounts);

router.get('/recent-vendors',authorize(['admin']), RecentVendorListing);


router.post('/employee-listing/:vendorId', authorize(['admin']), getEmpList);

router.delete('/delete-employee/:employeeId', authorize(['admin']), deleteEmployee);


export default  router;
