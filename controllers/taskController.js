import taskModel from '../models/taskModel.js';
import {getLocation, parseCoordinates,calculateDistanceAndDuration} from '../services/userService.js';
import employeeModel from '../models/employeeModel.js';
import vendorModel from '../models/vendorModel.js';
import clientModel  from '../models/clientModel.js';
import trackModel from '../models/trackModel.js';
import fs from 'fs';


import axios from 'axios';
const YOUR_GOOGLE_MAPS_API_KEY = process.env.GMAPAPI;

import multer from 'multer';
import path from  'path';

import moment from  'moment-timezone';

import { exit } from  'process';
import { broadcastLocationUpdate } from  '../socket.js';


import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;


// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/taskDoc");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({ storage }).single("taskDocument");




  export const createTask= async (req, res) => {
    try {

      let taskDocumentFilename = '';
      let taskImageFilename = '';
      if (req.files['taskDocument'] && req.files['taskDocument'].length > 0) {
        const taskDocumentFile = req.files['taskDocument'][0]; // Assuming maxCount is 1
        taskDocumentFilename = "taskDoc/"+taskDocumentFile.filename;
        console.log('Task taskDocumentFilename:', taskDocumentFilename);
      }
  
      if (req.files['taskImage'] && req.files['taskImage'].length > 0) {
        const taskImageFile = req.files['taskImage'][0]; // Assuming maxCount is 1
        taskImageFilename = "taskDoc/"+taskImageFile.filename;
        console.log('Task Image filename:', taskImageFilename);
      }

         const { userId, clientId, taskName, taskDate, address, lat, long, vendorId, type,  } = req.body;

        // task name, 

        //Check if any of the properties is empty or falsy
        if (!userId || !clientId  || !taskName || !taskDate || !address || !lat || !long || !vendorId || !type) {
          return res.status(400).json({ error: 'One or more fields are empty' });
        }

        // if (!userId || !taskName) {
        if ( !taskName) {
          return res.status(400).json({ error: 'Task description is empty' });
        }

        // check sendor admin or employee
        let createdBy = '';
        let empName = '';
        if (type == "vendor") {

          const vendorExisting = await vendorModel.findById({ _id: vendorId });

          createdBy = vendorExisting.vendorName;
          empName = vendorExisting.vendorName
        } else {

          const objectId = new ObjectId(vendorId);
          const empExisting = await employeeModel.findById({ _id: objectId });
          if (empExisting) {

            createdBy = empExisting.fullname;
          }



        }

        const empextes = await employeeModel.findById({ _id: userId });

        if (type == "vendor" && empextes) {
          empName = empextes.fullname;

        } else {

          empName = createdBy;

        }

        //get client mobile
        let clientMobile = '';
        let clientName = '';
        let clientEmail = '';
        if (clientId) {
          const clientExists = await clientModel.findById(clientId);

          if (clientExists) {
            clientMobile = clientExists.clientMobile;
            clientName = clientExists.clientFullName;
            clientEmail = clientExists.clientEmail;

          } else {
            clientMobile = "";
            clientName = "";
            clientEmail = "";
          }
        } else {
          clientMobile = "";
          clientName = "";
          clientEmail = "";
        }

        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


        let latitude = lat !=undefined &&  long !='' ? parseFloat(lat) :'';
        let longitude = long !=undefined && long !='' ? parseFloat(long) :'';

        const newTask = new taskModel({
          userId,
          clientId,
          clientName,
          clientEmail,
          empName: empName,
          clientMobile: clientMobile,
          taskName,
          taskDate,
          address,
          type,
          createdBy,
          created: currentDate,
         taskDocument: taskDocumentFilename,
         taskImage: taskImageFilename,
          vendorId: vendorId,
          location: {
            type: 'Point',
            coordinates: [latitude, longitude],
          },
        });

        await newTask.save();

        res.status(201).json({ message: 'Task created successfully' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error in creating task' });
    }


  };


  // //task Edit
  export const taskEdit= async (req, res) => {

    try {

      const { taskID } = req.params;

      // Find the task by ID
      const taskGet = await taskModel.findById(taskID, '-taskAddress');

      if (!taskGet) {
        return res.status(404).json({ message: 'Task not found' });
      }

      res.status(200).json(taskGet);


    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }


  };
   //Task list 
  export const taskList = async (req, res) => {
    try {
      const { vendorId } = req.params;
      const { status, taskDate } = req.query;
  
      if (!vendorId) {
        return res.status(400).json({ message: "Vendor ID is required." });
      }
  
      // Fetch employees with the given vendorId
      const employees = await employeeModel.find({ vendorId: vendorId });
      const employeeIds = employees.map(employee => employee._id);
  
      // Build the query
      let query = { vendorId: { $in: [vendorId, ...employeeIds] } };
  
      // Handle taskDate filter
      if (taskDate) {
        const startDate = moment(taskDate, 'YYYY-MM-DD').startOf('day').toDate();
        const endDate = moment(taskDate, 'YYYY-MM-DD').endOf('day').toDate();
        query.taskDate = { $gte: startDate, $lt: endDate };
      }
  
      // Handle status filter
      if (status !== undefined && ['0', '1', '2'].includes(status)) {
        query.status = status === '2' ? '0' : status;
      }
  
      // Fetch tasks from the database
      const tasks = await taskModel.find(query, '-taskAddress').sort({ taskDate: 1 });
  
      if (!tasks || tasks.length === 0) {
        return res.status(200).json({ tasks: [] });
      }
  
      // Format tasks
      const formattedTaskList = tasks.map(task => {
        const parsedTaskDate = moment.utc(task.taskDate).toDate();
        const hoursDiff = moment.utc().diff(parsedTaskDate, 'hours');
  
        return {
          ...task.toObject(),
          taskDate: moment.utc(task.taskDate).format('YYYY-MM-DD hh:mm A'),
          taskEndDate: task.taskEndDate 
            ? moment.utc(task.taskEndDate).format('YYYY-MM-DD hh:mm A') 
            : '',
          shouldInclude: status === '2' ? hoursDiff >= 24 : hoursDiff <= 24
        };
      }).filter(task => status !== '1' || task.shouldInclude);
      const totalTask = formattedTaskList.length
      return res.status(200).json({ totalTask, tasks: formattedTaskList });
    } catch (error) {
      console.error('Error fetching task list:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  

  //task Details By Employee id under working

  export const taskListByEmp= async (req, res) => {

    try {

      const { empId } = req.params;
      const { status, taskDate } = req.query;


      // Find the task by ID
      // const taskGet = await taskModel.find({ userId: empId });
      const query = { userId: empId };


      if (taskDate) {
        const startDate = new Date(taskDate);
        startDate.setUTCHours(0, 0, 0, 0); // Set to the start of the day
        const endDate = new Date(taskDate);
        endDate.setUTCHours(23, 59, 59, 999); // Set to the end of the day

        query.taskDate = {
          $gte: startDate,
          $lt: endDate
        };
      }


      if (status !== undefined && (status == '0' || status == '1' || status == '2')) {
        query.status = (status =='2') ? '0' :status;
      }

      // const tasks = await taskModel.find(query);

      const tasks = await taskModel.find(query, '-taskAddress').sort({ taskDate: 1 });


      if (!tasks || tasks.length === 0) {
        // If task list is empty or not found
        return res.status(200).json({ tasks: [] });
        // return res.status(404).json({ tasks: [] });

      } else {

        let formattedTaskList = [];
        if(status != '1') {

          formattedTaskList = tasks
          .map(task => {
            const parsedTaskDate = moment(task.taskDate, 'YYYY-MM-DD hh:mm A').toDate();
            const hoursDiff = moment().diff(parsedTaskDate, 'hours');
            
            return {
              ...task.toObject(),
              taskDate: moment(task.taskDate).format('YYYY-MM-DD hh:mm A'),
              // taskDate: parsedTaskDate,
              taskEndDate: (task.taskEndDate !=null && task.taskEndDate !='')? moment(task.taskEndDate).format('YYYY-MM-DD hh:mm A') :'',
              shouldInclude: (status === '2') ? hoursDiff >= 24 : hoursDiff <= 24
            };
          })
          .filter(task => task.shouldInclude);
        

        }else{
          // Format taskDate before sending the response
            formattedTaskList = tasks.map(task => ({
              ...task.toObject(),
              // taskEndDate: moment(task.taskEndDate).format('YYYY-MM-DD hh:mm A'),
              taskDate: moment(task.taskDate).format('YYYY-MM-DD hh:mm A'),
              taskEndDate: (task.taskEndDate !=null && task.taskEndDate !='')? moment(task.taskEndDate).format('YYYY-MM-DD hh:mm A') :'',
            }));
        }
        

        

        // If tasks are found
        return res.status(200).json({ tasks: formattedTaskList });

      }


    } catch (error) {
      console.error('Error in task :', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }
  };

  //task Update
  export const taskUpdates= async (req, res) => {

    try {

        const { taskID, userId, clientId, clientName, clientEmail, taskName, taskDate, address, lat, long,notes } = req.body;

        // Check if any of the properties is empty or falsy
        if (!taskID || !taskName) {
          return res.status(400).json({ error: 'Task TaskId or TaskName is empty' });
        }


        const task = await taskModel.findById(taskID);

        if (!task) {
          return res.status(400).json({ error: 'Task id not found' });
        }
        
        if (req.files['taskDocument'] && req.files['taskDocument'].length > 0) {
          const taskDocumentFile = req.files['taskDocument'][0]; // Assuming maxCount is 1
          let taskDocumentFilename = "taskDoc/"+taskDocumentFile.filename;
          
          // unlink previous document
          if (task.taskDocument) {
            const docPath = path.join(__dirname, '../public', task.taskDocument);
            console.log(docPath);
            if (fs.existsSync(docPath)) {
              fs.unlinkSync(docPath);
            }
          }
          //

          task.taskDocument = taskDocumentFilename;

        }
    
        if (req.files['taskImage'] && req.files['taskImage'].length > 0) {
          const taskImageFile = req.files['taskImage'][0]; // Assuming maxCount is 1
          let taskImageFilename = "taskDoc/"+taskImageFile.filename;

            // unlink previous image
            if (task.taskImage) {
              const imagePath = path.join(__dirname, '../public', task.taskImage);
              console.log(imagePath);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
            //
          task.taskImage =  taskImageFilename;

        
        }

        if (req.files['noteImage'] && req.files['noteImage'].length > 0) {
          const taskImageFile = req.files['noteImage'][0]; // Assuming maxCount is 1
          let noteImageFilename = "taskDoc/"+taskImageFile.filename;

            // unlink previous image
            if (task.noteImage) {
              const imagePath = path.join(__dirname, '../public', task.noteImage);
              console.log(imagePath);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
              }
            }
            //
          task.documentNotes =  noteImageFilename;
        
        }


        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');

        // task.clientId = clientId || task.clientId;
        // task.clientName = clientName || task.clientName;
        // task.clientEmail = clientEmail || task.clientEmail;
        task.taskName = taskName || task.taskName;
        task.userId = userId || task.userId;
        task.taskDate = taskDate || task.taskDate;
        task.address = address || task.address;
        task.created = currentDate || task.created;
        task.taskNotes = notes || task.taskNotes;

        //
        const empExisting = await employeeModel.findById({ _id: userId });
        if (empExisting) {
          task.empName = empExisting.fullname;
        }
        // task.location.coordinates[0] = lat || task.location.coordinates[0];
        // task.location.coordinates[1] = long || task.location.coordinates[1];

        await task.save();

        res.status(200).json({ message: 'Task updated successfully' });

    } catch (error) {
      console.error('Error for update the task:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  };

  //task delete
  export const taskDelete= async (req, res) => {

    try {

      const { taskId } = req.params;

      // Check if the task exists
      const existingTask = await taskModel.findById(taskId);

      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      // Perform the deletion
      await taskModel.findByIdAndDelete(taskId);

      // Send a success response
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error for task Delete:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  };

  // taskDone
  export const taskDone= async (req, res) => {

    try {

      upload(req, res, async function (err) {

        if (err instanceof multer.MulterError) {
          res.status(500).json({ error: "An error occurred during file upload." });
        } else if (err) {
          res.status(500).json({ error: "An unknown error occurred during file upload." });
        }

        const { taskID, notes, lat, long } = req.body;
          //  console.log('taskiddd',taskID)
        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const taskEndDate = currentDateIST.format('YYYY-MM-DD hh:mm A');


        // Check if any of the properties is empty or falsy
        if (!taskID) {
          return res.status(400).json({ error: 'TaskID is empty' });
        }

        if (!lat || !long) {
          return res.status(400).json({ error: 'Lat and Long is empty' });
        }


        const task = await taskModel.findById(taskID);

        if (!task) {
          return res.status(400).json({ error: 'Task is not found' });
        }

        // get lat long
        //const tasklat  = task.location.coordinates[0];
        //const tasklong = task.location.coordinates[1];

        // Get coordinates of the task
        //const taskCoords = `${task.location.coordinates[0]},${task.location.coordinates[1]}`;
       // const myCoords = `${lat},${long}`;

        // Calculate distance using your userService
        // const originCoords = await parseCoordinates(myCoords);
        // const destinationCoords = await parseCoordinates(taskCoords);
        // const result = await calculateDistanceAndDuration(originCoords, destinationCoords);
        // const distance = result.data.rows[0].elements[0].distance.text;
        // let distanceInMeters;
        //if(tasklat != '' && tasklong != ''){

          ///if (distance.includes('km')) {
            // Extract kilometers and convert to meters
          //  distanceInMeters = parseFloat(distance.split(' ')[0]) * 1000; // Extract "6.0", convert to float, multiply by 1000
        //  } else {
            // Extract meters
          //  distanceInMeters = parseInt(distance.split(' ')[0]); // Extract "59", convert to integer
         // }


          // if (distanceInMeters > 300) {
          //   return res.status(403).json({ error: 'You are not within 300 meters range of the task location' });
          // }
          // range 300meter
        //}

        // Check if file was provided
        
        let uploadedFile = '';

        if (req.file) {

          uploadedFile = "taskDoc/" + req.file.filename;
        }

        //get address from where task done
        const locationGet = await getLocation(lat, long);
        //const locationGet = 0;

        task.status = 1 || task.status;
        task.taskNotes = notes || task.taskNotes;
        task.documentNotes = uploadedFile || task.documentNotes;
        task.taskAddress = locationGet || task.taskAddress;
        task.location.coordinates[0] = lat || task.location.coordinates[0];
        task.location.coordinates[1] = long || task.location.coordinates[1];
        task.taskEndDate = taskEndDate || task.taskEndDate;

        await task.save();

        //track log inser here
        const newTrack = new trackModel({
          userId: task.userId,
          userType: "Task",
          status: 1,
          taskId: taskID,
          attendceId: 0,
          lat: lat,
          long: long,
          createdAt: taskEndDate,
        })
        await newTrack.save();
        // end track log

        const taskUpdate = { 
          taskId: task._id,
           userId: task.userId,
           locationGet,
            status: task.status, 
            updatedAt: new Date(),
         };
         broadcastLocationUpdate(taskUpdate)

        res.status(200).json({ message: 'Task Done Successfully' });

      });

    } catch (error) {
      console.error('Error in updating task status:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  };

  // //get distance and duration
  export const CheckDistanceAndDuration= async (req, res) => {

    try {

      const { origin, destination } = req.body;

      if (!origin || !destination) {
        return res.status(400).json({ message: 'Origin and destination coordinates are required.' });
      }
      
      // Parse origin and destination coordinates
      const originCoords = await parseCoordinates(origin);
      const destinationCoords = await parseCoordinates(destination);

      console.log('Origin:', originCoords);
       console.log('Destination:', destinationCoords);
       
      const result = await calculateDistanceAndDuration(originCoords, destinationCoords);

      console.log('API Response Data:', { 
        destination_addresses: result?.data?.destination_addresses, 
        origin_addresses: result?.data?.origin_addresses,
         elements: result?.data?.rows?.[0]?.elements 
        });

      if (result && result.data && result.data.rows && result.data.rows[0] && result.data.rows[0].elements && result.data.rows[0].elements[0]) {
         const distance = result.data.rows[0].elements[0].distance.text || 'N/A';
          const duration = result.data.rows[0].elements[0].duration.text || 'N/A'; 
          const destination_addresses = result.data.destination_addresses || 'N/A';
           const origin_addresses = result.data.origin_addresses || 'N/A'
           ; res.status(200).json({ 
            message: 'Get successfully', 
            distance,
             duration });
     } else { 
      throw new Error('Invalid response structure from distance API'); } }

      // res.status(200).json({
      //   message: 'Get successfully', distance,
      //   duration,
      //   origin: {
      //     address: origin_addresses,
      //     coordinates: originCoords,
      //   },
      //   destination: {
      //     address: destination_addresses,
      //     coordinates: destinationCoords,
      //   },
      //   destination_addresses,
      //   origin_addresses,
      // });

    catch (error) {
      console.error('Error fetching distance and duration:', error.message);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };

