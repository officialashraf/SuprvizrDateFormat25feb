
// const  blacklist  = require('validator');
// const loginModel = require('../models/loginModel');
// const attendanceModel = require('../models/attendanceModel');
// const taskModel = require('../models/taskModel');

import  User from '../models/user.js';
import  logoutModel from '../models/logoutModel.js';
import  trackModel from '../models/trackModel.js';

import  employeeModel from '../models/employeeModel.js';
import  vendorModel from '../models/vendorModel.js';

//import {generateOTP , isValidEmail,isValidMobile,isValidPassword, parseCoordinates,calculateDistanceAndDuration}  from '../services/userService.js';
import { sendOTP, sendEmployeeMsg }  from '../services/msgService.js';

import moment from 'moment-timezone';
import jwt from 'jsonwebtoken'



  //For create employee api
 export const signup = async (req, res) => {
    try {
      const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

      if (!fullname || !mobile || !userType || !machineNumber || !workLocation) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      // Check if the mobile already exists
      const existingMobile = await User.findOne({ mobile });



      if (!await userService.isValidMobile(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }

      if (existingMobile) {
        return res.status(400).json({ message: 'Mobile already exists' });
      }


      // Create a new user
      const newUser = new User({ fullname, mobile, userType, machineNumber, workLocation });

      // Save the user to the database
      await newUser.save();

      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  //login Signup Mobile Otp api
  // loginSignupMobileOtp = async (req, res) => {

  //   try {
  //     const { mobileNumber } = req.body;

  //     const mobileNumberRegex = /^\d{10}$/;

  //     if (!mobileNumberRegex.test(mobileNumber)) {
  //       return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
  //     }

  //     const user = await User.findOne({ mobile: mobileNumber });
  //     // const otpCode = await userService.generateOTP();
  //     const otpCode = "1234";

  //     if (!user) {

  //       const newUser = new User({ mobile: mobileNumber, otp: otpCode });
  //       await newUser.save();

  //       res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

  //     } else {
  //       const userId = user._id;
  //       const update = { otp: otpCode };

  //       const result = await User.updateOne({ _id: userId }, update);

  //       if (result.matchedCount === 1) {

  //         console.log('OTP updated successfully');

  //       } else {

  //         console.log('User not found or OTP not updated');
  //       }

  //       res.status(200).json({ message: 'Otp sent successfully!', otp: otpCode });

  //     }
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({ message: 'Internal Server Error', error });
  //   }

  // },

  export const loginSignupMobileOtp = async (req, res) => {

    try {
      const { mobileNumber } = req.body;
      const mobileNumberRegex = /^\d{10}$/;

      // Validate the mobile number
      if (!mobileNumberRegex.test(mobileNumber)) {
        return res.status(400).json({ error: 'Enter a valid 10-digit mobile number' });
      }
  
      // Check if the mobile number exists in the vendor or employee model
      const vendor = await vendorModel.findOne({ vendorMobile: mobileNumber });
      const employee = await employeeModel.findOne({ mobile: mobileNumber });
      const otpCode = await userService.generateOTP();
  
      // Get the current date and future date in Asia/Kolkata timezone
      const currentDateIST = moment.tz('Asia/Kolkata').startOf('day').format('YYYY-MM-DD');
      const futureDateIST = moment.tz('Asia/Kolkata').startOf('day').add(15, 'days').format('YYYY-MM-DD');
  
      // If the mobile number exists in the vendor model
      if (vendor) {
        // Update vendor subscription dates if necessar
        
        if (!vendor.subEndDate) {
          vendor.subStartDate = currentDateIST;
          vendor.subEndDate = futureDateIST;
        }
  
        // Update OTP
        vendor.vandorOtp = otpCode;
        await vendor.save();
  
        // Send OTP to vendor
        await sendOTP(mobileNumber, otpCode);
        return res.status(200).json({ message: 'OTP sent successfully!', otp: otpCode,type:'vendor' });
  
      // If the mobile number exists in the employee model
      } else if (employee) {
        const userId = employee._id;
        const update = { otp: otpCode };
  
        await employeeModel.updateOne({ _id: userId }, update);
  
        // Send OTP to employee
        await sendOTP(mobileNumber, otpCode);
        return res.status(200).json({ message: 'OTP sent successfully!', otp: otpCode,type:'employee'});
  
      // If the mobile number does not exist in either model, create a new vendor
      }
      
      else {
        return res.status(404).json({
          message: 'Mobile number does not exist.',
        });
      }
    } catch (error) {
      // Handle any errors
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }


  };
  
  //generate otp

  export const generateOTP = async (req, res) => {
    try {
      const { mobile } = req.body;


      // Fetch the user from the database
      const user = await User.findOne({ mobile });


      if (!user) {
        return res.status(404).json({ message: 'Mobile number is not valid!' });
      }


      // Generate an OTP (for example, a 6-digit numeric code)
      // const otpCode = await userService.generateOTP();
      const otpCode = "1234";

      const userId = user._id;
      const filter = { _id: userId };
      const update = { otp: otpCode };

      //update otp in db

      try {
        const result = await User.updateOne(filter, update);
        console.log(result.matchedCount === 1 ? 'OTP updated successfully' : 'Error in updating!');
      } catch (error) {
        console.error('Error updating OTP:', error);
      }


      // Send the OTP via SMS 
      // Replace the next line with your code to send the OTP

      res.status(200).json({ message: 'OTP generated successfully', otp: otpCode });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to generate OTP' });
    }
  };

  //verify otp
  export const  verifyOTP = async (req, res) => {
    try {
      const { otp, mobile } = req.body;

      const storedOTP = await User.findOne({ mobile });

      if (otp === storedOTP.otp) {

        //update user status
        const filter = { mobile: mobile };
        const update = { status: 1 };

        try {
          const result = await User.updateOne(filter, update);
          console.log(result.matchedCount === 1 ? 'Status updated successfully' : 'Error in Status updating!');
        } catch (error) {
          console.error('Error updating OTP:', error);
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: storedOTP._id, mobile: storedOTP.mobile }, 'yourSecretKey', {
          expiresIn: '1h', // Token expiration time
        });


        res.status(200).json({ message: 'OTP verification successful', token });
      } else {
        res.status(400).json({ message: 'Invalid OTP' });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to verify OTP' });
    }
  };

  //users list api
  export const getAllUser = async (req, res) => {
    try {
      const users = await User.find({}, '-password -otp'); // Exclude password and OTP from the response

      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching all users:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  //forgot api for sending link 

  export const forgotPassword = async (req, res) => {
    try {
      const { mobile } = req.body;

      // Find the user by email
      const user = await User.findOne({ mobile });

      if (!user) {
        return res.status(404).json({ message: 'Mobile number not found' });
      }

      // Generate a password reset token
      const token = jwt.sign({ userId: user._id }, 'yourSecretKey', { expiresIn: '15m' });

      // Send the password reset link via email (for demonstration purposes, log to the console)
      console.log('Password Reset Link:', `${process.env.BASE_URL}/api/user/reset-password/${token}`);

      res.status(200).json({ message: 'Password reset link sent successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  //reset api for change Password 

  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Verify the token
      const decodedToken = jwt.verify(token, 'yourSecretKey');

      // Find the user by the decoded user ID
      const user = await User.findById(decodedToken.userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Update the user's password
      user.password = newPassword;
      await user.save();

      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
      // Handle token expiration or invalid token errors
      console.error(error);
      res.status(400).json({ message: 'Invalid or expired token' });
    }
  };

  //get profile details
  export const getUserProfile = async (req, res) => {
    try {
      const { userId } = req.params;

      // Find the user by ID
      const user = await User.findById(userId, '-password -otp');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user);

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  //update profile data
  export const updateUserProfile = async (req, res) => {
    try {
      const { userId } = req.params;
      // const { fullname, username, email, newPassword } = req.body;

      const { fullname, mobile, userType, machineNumber, workLocation } = req.body;

      if (!fullname || !mobile || !userType || !machineNumber || !workLocation) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }


      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }



      if (!await userService.isValidMobile(mobile)) {
        return res.status(400).json({ message: 'Invalid mobile number' });
      }


      // If the mobile number is updated, check if it already exists for another user
      if (mobile !== user.mobile) {
        const existingMobile = await User.findOne({ mobile });

        if (existingMobile && existingMobile._id.toString() !== userId) {
          return res.status(400).json({ message: 'Mobile number already exists for another user' });
        }
      }

      // Update profile fields
      user.fullname = fullname || user.fullname;
      user.mobile = mobile || user.mobile;
      user.userType = userType || user.userType;
      user.machineNumber = machineNumber || user.machineNumber;
      user.workLocation = workLocation || user.workLocation;

      // Update password if newPassword is provided
      // if (newPassword) {
      //   // Hash the new password
      //   const hashedPassword = await userService.hashPassword(newPassword);
      //   user.password = hashedPassword;
      // }

      // Save the updated user to the database
      await user.save();

      res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


  // //getUserTrack
  // getUserTrack = async (req, res) => {
  //   try {

  //     const userId = req.params.userId;

  //     const user = await User.findById(userId, '-password -otp');
  //     if (!user) {
  //       return res.status(404).json({ error: 'User not found' });
  //     }

  //     const attendance = await attendanceModel.find({ userId });
  //     const tasks = await taskModel.find({ userId });
  //     const taskCount = tasks.length; // Count of tasks


  //     //get distance lat long start
  //     var distance;
  //     var duration;

  //     // console.log(attendance.length);

  //     if (attendance.length > 0 && attendance[0]['locationOut']['coordinates'][0]) {

  //       const originLat = attendance[0]['locationIn']['coordinates'][0];
  //       const originLong = attendance[0]['locationIn']['coordinates'][1];

  //       const destinationLat = attendance[0]['locationOut']['coordinates'][0];
  //       const destinationLong = attendance[0]['locationOut']['coordinates'][1];

  //       const locationInLatLong = originLat + ',' + originLong;
  //       const locationOutLatLong = destinationLat + ',' + destinationLong;

  //       const originCoords = await userService.parseCoordinates(locationInLatLong);
  //       const destinationCoords = await userService.parseCoordinates(locationOutLatLong);

  //       const result = await userService.calculateDistanceAndDuration(originCoords, destinationCoords);

  //       distance = result.data.rows[0].elements[0].distance.text;
  //       duration = result.data.rows[0].elements[0].duration.text;

  //     } else {

  //       distance = 0;
  //       duration = 0;
  //     }
  //     //end loc

  //     res.status(200).json({ user, attendance, tasks, origin: { distance: distance, duration: duration, taskCount: taskCount } });

  //   } catch (error) {
  //     console.error('Error fetching user--tracking-related data:', error);
  //     res.status(500).json({ message: 'Internal Server Error' });
  //   }
  // },



  //CurrentLocation
  export const  currentLocation = async (req, res) => {
    try {
      const { userId, lat, long } = req.body;

      if (!userId || !lat || !long) {
        return res.status(400).json({ error: 'One or more fields are empty' });
      }

      const user = await User.findById(userId, '-password -otp');
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.latitude = lat || user.latitude;
      user.longitude = long || user.longitude;

      await user.save();

      res.status(200).json({ message: 'Current location updated successfully' });

    } catch (error) {
      console.error('Error fetching user current location', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };


  //delete Vendor
  export const userDelete = async (req, res) => {

    try {

      const { userId } = req.params;

      // Check if the task exists
      const existingUser = await User.findById(userId);

      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Perform the deletion
      await User.findByIdAndDelete(userId);

      // Send a success response
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Error for User Delete:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
    }

  };


   //logout for vendoor/ emp
   export const logout = async (req, res) => {
    try {
        const { userId, lat, long, type } = req.body;
      
        // Check if any field is empty
        if (!userId || !lat || !long || !type ) {
            return res.status(400).json({ error: 'One or more fields are empty' });
        }

        let userExisting;
        if (type === "vendor") {
            userExisting = await vendorModel.findById(userId); // Assuming vendorModel is correctly imported and used
        } else {
            userExisting = await employeeModel.findById(userId); // Assuming employeeModel is correctly imported and used
        }

        if (!userExisting) {
            return res.status(404).json({ error: 'User not found' });
        }

        userExisting.loginStatus = 'Logout';
        await userExisting.save();
        //
        const myDate = new Date();
        const currentDateIST = moment.tz(myDate, 'Asia/Kolkata');
        const currentDate = currentDateIST.format('YYYY-MM-DD hh:mm A');
        const createdAt = currentDateIST.format('YYYY-MM-DD');

      const locationGet = await userService.getLocation(lat, long);

        // Save gps record
        const savedLogout = new logoutModel({
            userId,
            type,
            logoutDate: currentDate,
            logoutLat: lat,
            logoutLong: long,
            logoutAddress: locationGet,
            createdAt: createdAt,
        });
        
        await savedLogout.save();

        // Save track log
        let status = 'Logout';
        const newTrack = new trackModel({
            userId,
            userType: type,
            status,
            taskId: 0, 
            lat,
            long,
            logoutId: savedLogout._id, // Using the _id of savedLogout
            createdAt: currentDate,
        });
        await newTrack.save();
       
       
        // Respond with success message
        res.status(200).json({ message: `${status} Successfully` });

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};











