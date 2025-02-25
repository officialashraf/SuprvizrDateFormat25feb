import attendanceModel from '../models/attendanceModel.js';
import vendorModel from '../models/vendorModel.js';
import employeeModel from '../models/employeeModel.js';
import trackModel from '../models/trackModel.js';

import {getLocation} from '../services/userService.js';
import { broadcastLocationUpdate } from '../socket.js';

import axios from 'axios';
import moment from 'moment-timezone';0
  //For attendance in api

 export const checkIn =  async (req, res) => {
    try {
      const { userId, lat, long, type } = req.body;


      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      const myDate = new Date();
      const currentDateIST = moment.utc(myDate);
      const currentDate = currentDateIST.format('YYYY-MM-DD HH:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');


      const locationGet = await getLocation(lat, long);
       console.log(locationGet);
      // Proceed with the check-in process
      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        createdAt: createdAt,
        status: "IN",
      });

      await newAttendance.save();

      const checkInData = { 
        userId,
         type,
         attnedanceDate: currentDate,
         attnedanceLat: lat,
         attnedanceLong: long, 
         attnedanceAddress: locationGet,
          createdAt: createdAt,
          status: "IN",
         };
       broadcastLocationUpdate(checkInData)

      res.status(200).json({ message: 'Attendance ' + newAttendance.status+ ' Successfully' });
    } catch (error) {
      console.error('Error recording attendance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  //For attendance out api
  export const checkOut=  async (req, res) => {
    try {

      const { userId, lat, long, type } = req.body;

      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      const myDate = new Date();
      const currentDateIST = moment.utc(myDate);
      const currentDate = currentDateIST.format('YYYY-MM-DD HH:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      const locationGet = await getLocation(lat, long);

      // Proceed with the check-in process
      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        status: "OUT",
        createdAt: createdAt,
      });

      await newAttendance.save();
      const checkOutData = { 
        userId,
         type,
         attnedanceDate: currentDate,
         attnedanceLat: lat,
         attnedanceLong: long, 
         attnedanceAddress: locationGet,
          createdAt: createdAt,
          status: "Out"
         };
       broadcastLocationUpdate(checkOutData)

      res.status(200).json({ message: 'Attendance ' + newAttendance.status + ' Successfully' });

    } catch (error) {
      console.error('Error checking out attendance:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  // all Attendece list 
  export const allAttendece=  async (req, res) => {

    try {

      const { userId } = req.params;

      // Find the user by ID
      const attendance = await attendanceModel.find({ userId: userId }).sort({ attnedanceDate: 1 });

      if (!attendance) {
        return res.status(404).json({ error: 'Not Found', message: 'Attendance record not found for the given user ID' });
      }

      res.status(200).json(attendance);
    } catch (error) {
      console.error('Error fetching attendance by ID:', error);
      res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }

  };



  //get distance and duration 
  // export const getDuration=  async (req, res) => {

  //   const apiKey = process.env.GMAPAPI;
  //   const origin = req.body.origin;
  //   const destination = req.body.destination;

  //   try {
  //     const response = await axios.get(
  //       `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`
  //     );

  //     // console.log(response);

  //     const distance = response.data.rows[0].elements[0].distance.text;
  //     const duration = response.data.rows[0].elements[0].duration.text;

  //     res.json({ distance, duration });
  //   } catch (error) {
  //     console.error('Error:', error.message);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }


  // };
  export const getDuration = async (req, res) => {
    const origin = req.body.origin; // Example: "13.388860,52.517037"
    const destination = req.body.destination; // Example: "13.397634,52.529407"
  
    try {
      const response = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=false&geometries=polyline&steps=false`
      );
  
      // Extract distance and duration
      const distance = response.data.routes[0].distance / 1000; // Convert meters to kilometers
      const duration = response.data.routes[0].duration / 60; // Convert seconds to minutes
  
      res.json({ distance: `${distance.toFixed(2)} km`, duration: `${duration.toFixed(2)} min` });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const attendanceInOut=  async (req, res) => {
    try {

      const { userId, lat, long, type } = req.body;

      
      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const myDate = new Date();
      const currentDateIST = moment.utc(myDate, 'Asia/Kolkata');
      const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      //for even odd condition
      // const userStatusCount = await attendanceModel.countDocuments({ userId });
      // let status = "IN";
      // if (userStatusCount % 2 === 1) {
      //   status = "OUT";
      // }

      const userStatusCount = await attendanceModel.findOne({ userId: userId, createdAt: createdAt }).sort({ _id: -1 }).exec();

      let status = '';

      if (userStatusCount === null) {

        status = "IN";

      } else {

        if (userStatusCount.status == 'IN') {

          status = "OUT";

        } else {

          status = "IN";

        }
      }
const agoCreatedAt  = moment.utc(myDate, 'Asia/Kolkata')
const agoDate = agoCreatedAt.format('YYYY-MM-DD hh:mm A');
//const agoDate = agoCreatedAt.format('YYYY-MM-DD');

console.log(agoDate); // Example Output: 2025-01-08 07:05 PM
console.log(agoCreatedAt); // Example Output: 2025-01-08

      if (type == 'vendor') {

        const filter = { _id: userId };
        const updateDoc = {
          $set: {
            agoDate: agoDate,
            attendanceStatus: status,
            vandorLat: lat,
            vandorLong: long

          }
        };

        const result = await vendorModel.updateOne(filter, updateDoc);

      } else {


        const filter = { _id: userId };
        const updateDoc = {
          $set: {
            agoDate: agoDate,
            attendanceStatus: status,
            latitude: lat,
            longitude: long
          }
        };

        const result = await employeeModel.updateOne(filter, updateDoc);


      }
      const locationGet = await getLocation(lat, long);
      const newAttendance = new attendanceModel({
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        status,
        createdAt: createdAt,
      });

      const savedAttendance = await newAttendance.save();
      const insertedId = savedAttendance._id;

      //track log inser here
      const newTrack = new trackModel({
        userId,
        userType: type,
        status,
        taskId: 0,
        lat: lat,
        long: long,
        attendceId: insertedId,
        createdAt: currentDate,
      })
      await newTrack.save();

      const checkInOutData = { 
        userId,
         type,
         attnedanceDate: currentDate,
         attnedanceLat: lat,
         attnedanceLong: long, 
         attnedanceAddress: locationGet,
          createdAt: createdAt,
          status
         };
       broadcastLocationUpdate(checkInOutData)
      
      // end track log

      res.status(200).json({ message: 'Attendance ' + status + ' Successfully' });

    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };



  //autolog
  export const autologOut=  async (req, res) => {
    try {

      const currentDateIST = moment.utc(new Date());
      const currentDate = currentDateIST.format('YYYY-MM-DD HH:mm A');
      const createdAt = currentDateIST.format('YYYY-MM-DD');

      const agoDate = new Date().toISOString();

      const startOfDay = new Date();
      startOfDay.setUTCHours(0, 0, 0, 0);

      const endOfDay = new Date();
      endOfDay.setUTCHours(23, 59, 59, 999);


      const userAttendances22 = await attendanceModel.aggregate([
        { $match: { createdAt: createdAt } },
        { $sort: { _id: -1 } },
        { $group: { _id: "$userId", lastAttendance: { $first: "$$ROOT" } } }
      ]);

      const userAttendancesArray = userAttendances22.map(item => item.lastAttendance);

      if (userAttendancesArray && userAttendancesArray.length > 0) {

        for (const attendance of userAttendancesArray) {
          if (attendance && attendance.status == 'IN') {

            // Check if time is 11:59 PM
            const currentHour = currentDateIST.hours(); // Get the current hour (0-23)
            const currentMinute = currentDateIST.minutes(); // Get the current minute (0-59)

            // if (currentHour === 23 && currentMinute === 59) {
            const status = "OUT";

            if (attendance.type === 'vendor') {
              // Update vendor attendance
              await vendorModel.updateOne({ _id: attendance.userId }, {
                $set: {
                  agoDate: agoDate,
                  attendanceStatus: status,
                  vandorLat: 0,
                  vandorLong: 0
                }
              });
            } else {
              // Update employee attendance
              await employeeModel.updateOne({ _id: attendance.userId }, {
                $set: {
                  agoDate: agoDate,
                  attendanceStatus: status,
                  latitude: 0,
                  longitude: 0
                }
              });
            }

            // Create new attendance record
            const newAttendance = new attendanceModel({
              userId: attendance.userId,
              type: attendance.type,
              attnedanceDate: currentDate,
              attnedanceLat: 0,
              attnedanceLong: 0,
              attnedanceAddress: "0",
              status,
              createdAt: createdAt,
            });

            const savedAttendance = await newAttendance.save();
            const insertedId = savedAttendance._id;
            const locationGet = await getLocation(lat, long);
            // Track log insertion
            const newTrack = new trackModel({
              userId: attendance.userId,
              userType: attendance.type,
              status,
              taskId: 0,
              lat: 0,
              long: 0,
              attendceId: insertedId,
              createdAt: currentDate,
            });
            await newTrack.save();

            const logOutData = { 
              userId: attendance.userId,
               type: attendance.type, 
              status,
               attnedanceDate:currentDate,  
               attnedanceLat: lat, 
               attnedanceLong: long,
                attnedanceAddress: locationGet,
                 createdAt: createdAt, 
                };
             broadcastLocationUpdate(logOutData);

          }
        }
        // Send response after inserting new entries
        res.status(200).json({ message: 'Attendance Auto Logout Successfully' });

      } else {
        console.error('Error:', "No Record Found");
        // return res.status(500).json({ error: 'No Record Found' });

      }

    } catch (error) {
      console.error('Error:', error.message);
      // res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  export const getAttendanceStatus = async (req, res) => {
    try {
      const { userId } = req.body; // Get userId from body
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      
      const latestAttendance = await attendanceModel
        .findOne({ userId })
        .sort({ _id: -1 }); // Fetch the latest attendance record
  
      if (!latestAttendance) {
        return res.status(404).json({ error: "No attendance record found" });
      }
  
      res.status(200).json({
        status: latestAttendance.status,
        message: `User is currently ${latestAttendance.status}`,
      });
    } catch (error) {
      console.error("Error fetching status:", error.message);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };









