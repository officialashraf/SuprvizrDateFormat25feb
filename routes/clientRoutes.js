import express from 'express'
const router = express.Router();
import {createClient, clientDetails, clientList, clientDelete,updateClients} from '../controllers/clientController.js';
import {authorize} from '../middlewares/auth.js'
import multer from 'multer';
const upload = multer();


router.post('/create',authorize(['employee', 'vendor','admin']), createClient);// Define your all task Controller route
router.get('/list/:vendorId',authorize(['employee','vendor','admin']) , clientList);//vendor id issue
router.get('/details/:clientId', clientDetails);
router.delete('/delete/:clientId',authorize(['employee','vendor','admin']), clientDelete);
router.post('/update-client',authorize(['employee','vendor','admin']), updateClients);

export default router;