import express from 'express'
const router = express.Router();
import {createReimbrushment, reimbrushmentDelete, reimbrushmentList,reimbrushmentEdit,updateStatus,reimbrushmentUpdate,getReimbursementSums} from  '../controllers/reimbursementController.js';
import { taskDocumentUploadHandler } from  '../middlewares/multer-config.js';

// Define your all task Controller route
router.post('/create',taskDocumentUploadHandler.fields([
    { name: 'reimbursementDoc', maxCount: 1 }]),
    createReimbrushment);

// router.post('/create', createReimbrushment);

router.post('/list', reimbrushmentList);
router.get('/edit/:reimbId', reimbrushmentEdit);

router.post('/updateStatus', updateStatus);

router.post('/update',taskDocumentUploadHandler.fields([
    { name: 'reimbursementDoc', maxCount: 1 }]),
    reimbrushmentUpdate);

router.delete('/delete/:reimbId', reimbrushmentDelete);

router.post('/reimbursement-sum', getReimbursementSums);



 export default router;