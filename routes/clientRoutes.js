import express from 'express'
const router = express.Router();
import {createClient, clientDetails, clientList, clientDelete,updateClients} from '../controllers/clientController.js';
import {authorize} from '../middlewares/auth.js'
import multer from 'multer';
const upload = multer();


router.post('/create',authorize(['vendor','admin']), createClient);// Define your all task Controller route
router.get('/list/:vendorId',authorize(['vendor','admin']) , clientList);//vendor id issue
router.get('/details/:clientId', clientDetails);
router.delete('/delete/:clientId',authorize(['vendor','admin']), clientDelete);
router.post('/update-client',authorize(['vendor','admin']), updateClients);

export default router;