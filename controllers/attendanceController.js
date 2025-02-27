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
      const currentDateIST = myDate.getTime();
      const currentDate = currentDateIST;
      const createdAt = currentDateIST;


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
      const currentDate = currentDateIST;
      const createdAt = currentDateIST;

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
console.log("record", attendance)
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

  export const attendanceInOut = async (req, res) => {
    try {
      const { userId, lat, long, type } = req.body;
  
      // Check if any one empty
      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }
  
      const myDate = new Date();
      const currentDateIST = myDate.getTime();
      const currentDate = currentDateIST;
      const createdAt = currentDateIST;
  
      // Fetch the most recent attendance entry for the user
      const userStatusCount = await attendanceModel.findOne({ userId: userId,createdAt: { $lte: new Date().getTime() }}).sort({ createdAt: -1 }).exec();
      console.log("status", userStatusCount);
      let status = '';
  
      if (userStatusCount === null) {
        status = "IN";
      } else {
        if (userStatusCount.status === 'IN') {
          status = "OUT";
        } else {
          status = "IN";
        }
      }
  
      const agoCreatedAt = myDate.getTime();
      const agoDate = agoCreatedAt;
  
      console.log(agoDate);
      console.log(agoCreatedAt);
  
      if (type == 'vendor') {
        const filter = { _id: userId };
        const updateDoc = {
          $set: {
            agoDate: agoDate,
            attendanceStatus: status,
            vandorLat: lat,
            vandorLong: long,
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
            longitude: long,
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
      console.log("newAttendance", newAttendance);
      const savedAttendance = await newAttendance.save();
      const insertedId = savedAttendance._id;
  
      // Track log insert here
      const newTrack = new trackModel({
        userId,
        userType: type,
        status,
        taskId: 0,
        lat: lat,
        long: long,
        attendceId: insertedId,
        createdAt: createdAt,
      });
      await newTrack.save();
      console.log("newTrack", newTrack);
  
      const checkInOutData = {
        userId,
        type,
        attnedanceDate: currentDate,
        attnedanceLat: lat,
        attnedanceLong: long,
        attnedanceAddress: locationGet,
        createdAt: createdAt,
        status,
      };
      broadcastLocationUpdate(checkInOutData);
  
      res.status(200).json({ message: 'Attendance ' + status + ' Successfully' });
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  

  //autolog
  export const autologOut = async (req, res) => {
    try {
        const myDate = new Date();
        const currentDateIST = myDate.getTime();
        const createdAt = currentDateIST;

        const startOfDay = new Date();
        startOfDay.setUTCHours(0, 0, 0, 0);
        const startOfDayEpoch = startOfDay.getTime();

        const endOfDay = new Date();
        endOfDay.setUTCHours(23, 59, 59, 999);
        const endOfDayEpoch = endOfDay.getTime();

        // पूरे दिन की आखिरी एंट्री निकालें
        const userAttendances22 = await attendanceModel.aggregate([
            { $match: { createdAt: { $gte: startOfDayEpoch, $lte: endOfDayEpoch } } },
            { $sort: { _id: -1 } },
            { $group: { _id: "$userId", lastAttendance: { $first: "$$ROOT" } } }
        ]);

        const userAttendancesArray = userAttendances22.map(item => item.lastAttendance);

        if (!userAttendancesArray || userAttendancesArray.length === 0) {
            return res.status(404).json({ error: "No Record Found" });
        }

        for (const attendance of userAttendancesArray) {
            if (attendance && attendance.status === 'IN') {
                const status = "OUT";

                if (attendance.type === 'vendor') {
                    const updateResult = await vendorModel.updateOne(
                        { _id: attendance.userId },
                        { $set: { agoDate: createdAt, attendanceStatus: status, vandorLat: 0, vandorLong: 0 } }
                    );
                } else {
                    const updateResult = await employeeModel.updateOne(
                        { _id: attendance.userId },
                        { $set: { agoDate: createdAt, attendanceStatus: status, latitude: 0, longitude: 0 } }
                    );
                }

                const newAttendance = new attendanceModel({
                    userId: attendance.userId,
                    type: attendance.type,
                    attnedanceDate: createdAt,
                    attnedanceLat: 0,
                    attnedanceLong: 0,
                    attnedanceAddress: "0",
                    status,
                    createdAt: createdAt,
                });

                const savedAttendance = await newAttendance.save();
                const insertedId = savedAttendance._id;

                const logOutData = {
                    userId: attendance.userId,
                    type: attendance.type,
                    status,
                    attnedanceDate: createdAt,
                    attnedanceLat: 0,
                    attnedanceLong: 0,
                    attnedanceAddress: "0",
                    createdAt: createdAt,
                };

                broadcastLocationUpdate(logOutData);
            }
        }

        res.status(200).json({ message: 'Attendance Auto Logout Successfully' });

    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
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









