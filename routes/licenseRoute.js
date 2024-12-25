import express from 'express'
const router = express.Router();
import { createLicense,licenseDelete, licenseEdit,licenseList, licenseUpdate}  from '../controllers/licenseController.js';
import { taskDocumentUploadHandler }  from '../middlewares/multer-config.js';
import{ authorize } from '../middlewares/auth.js';

// Define your all task Controller route

router.post('/create',taskDocumentUploadHandler.fields([
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 }]),authorize(['admin','vendor']),
        createLicense);
        

router.post('/list', licenseList ,authorize(['admin','vendor']));
router.get('/edit/:licenseId', licenseEdit,authorize(['admin','vendor','employee']),);

router.post('/update',taskDocumentUploadHandler.fields([
    { name: 'licenseDocument', maxCount: 1 },
    { name: 'licenseImage', maxCount: 1 }]), 
    authorize(['admin','vendor']),
    licenseUpdate);
    

router.delete('/delete/:licenseId', authorize(['admin','vendor']), licenseDelete);




export default router;