import express from 'express'
const router = express.Router();
import { authorize } from '../middlewares/auth.js';
import {createEmp, getEmpList, getEmployee,filterEmpType,updateEmployee,employeeLogin,verifyOTP,currentLocation,clientList,taskList,trackEmpRecord, empDelete, getEmpTrack} from '../controllers/employeeController.js'

router.post('/create-employee',createEmp);
router.get('/empList/:vendorId',authorize(['vendor','admin']),getEmpList);
router.get('/getEmpDetail/:userId',authorize(['vendor','employee', 'admin']),getEmployee );
router.post('/get-filter-emp',authorize(['vendor','admin']),filterEmpType);
router.put('/update-employee/:userId',authorize(['vendor','admin']),updateEmployee);
router.post('/employee-login',employeeLogin);
router.post('/verify',verifyOTP);
router.post('/trackEmployee',authorize(['employee','vendor','admin']),getEmpTrack);//C//ws
router.post('/employeeNewTracking',authorize(['employee','vendor','admin']),trackEmpRecord);//C//ws
router.delete('/delete/:userId',authorize(['vendor','admin']),empDelete);
router.post('/current-location',currentLocation);//ws
router.get('/clientlist/:userId',clientList);//C
router.get('/taskList/:userId',authorize(['vendor','admin', 'employee']),taskList );

export default router;
