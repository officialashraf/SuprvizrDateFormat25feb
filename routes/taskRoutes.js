import express from 'express'
const router = express.Router();
import  { createTask, taskDelete,taskEdit, taskList,taskUpdates,taskDone,taskListByEmp,CheckDistanceAndDuration, taskListByVendor}  from '../controllers/taskController.js';

import  { taskDocumentUploadHandler }  from '../middlewares/multer-config.js';



router.post('/create', taskDocumentUploadHandler.fields([ // Define your all task Controller route
    { name: 'taskDocument', maxCount: 1 },
    { name: 'taskImage', maxCount: 1 }]),

    createTask);
   

    
router.get('/list/:userId/:userType', taskList);
router.get('/vendor/:vendorId', taskListByVendor);
router.get('/edit/:taskID', taskEdit);

router.post('/task-update',taskDocumentUploadHandler.fields([
    { name: 'taskDocument', maxCount: 1 },
    { name: 'taskImage', maxCount: 1 },
    { name: 'noteImage', maxCount: 1 }]), 
    taskUpdates);
    
router.delete('/delete/:taskId', taskDelete);
router.post('/done', taskDone);
router.post('/getDistance', CheckDistanceAndDuration);

router.get('/get-task-empids/:empId', taskListByEmp);


export default router;
