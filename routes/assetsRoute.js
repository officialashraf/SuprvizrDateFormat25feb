import express from 'express'
const router = express.Router();
import {createAsset,assetsDelete, assetsList,assetsEdit, assetsUpdate} from '../controllers/assetsController.js'
import { taskDocumentUploadHandler }  from '../middlewares/multer-config.js';
import {authorize}  from '../middlewares/auth.js'

// Define your all task Controller route
router.post('/create',taskDocumentUploadHandler.fields([
    { name: 'assetDocument', maxCount: 1 }]), authorize(['vendor', 'admin']),
    createAsset);

// router.post('/create', createReimbrushment);

router.post('/list',authorize(['vendor', 'admin']), assetsList);
router.get('/edit/:assetId',authorize(['vendor', 'admin', 'employee']), assetsEdit);

router.post('/update',taskDocumentUploadHandler.fields([ { name: 'assetDocument', maxCount: 1 }]),authorize(['vendor', 'admin']), assetsUpdate);

router.delete('/delete/:assetId',authorize(['vendor', 'admin']), assetsDelete);




export default router;